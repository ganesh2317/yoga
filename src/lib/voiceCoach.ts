import type { FrameEvaluation, JointEvaluation, JointStatus, YogaPose } from '../types';
import { JOINT_FEEDBACK_TEMPLATES } from './feedbackEngine';
import { mirrorJointLabel } from './mirror';

interface JointVoiceState {
  lastStatus: JointStatus;
  lastSpokenTimestamp: number;
}

class VoiceCoachService {
  private jointStates: Map<string, JointVoiceState> = new Map();
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private lastPositiveTime: number = 0;
  private goodHoldStartTime: number | null = null;
  private flaggedJoints: Set<string> = new Set();

  constructor() {
    const savedMute = localStorage.getItem('yogasense_voice_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('yogasense_voice_muted', String(muted));
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public reset(): void {
    this.jointStates.clear();
    this.flaggedJoints.clear();
    this.goodHoldStartTime = null;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public speak(text: string): void {
    if (this.isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    window.speechSynthesis.speak(utterance);
  }

  public speakFeedback(evaluation: FrameEvaluation, _pose?: YogaPose): void {
    this.processFrame(evaluation.jointEvaluations, evaluation.score);
  }

  public processFrame(
    jointEvaluations: Record<string, JointEvaluation>,
    overallScore: number | null
  ): void {
    if (this.isMuted) return;

    const now = Date.now();
    const evals = Object.values(jointEvaluations).filter(
      (e) => e.status !== 'Unknown'
    );
    if (evals.length === 0) return;

    interface Candidate {
      joint: JointEvaluation;
      isTransition: boolean;
      severity: number;
    }

    const candidates: Candidate[] = [];
    let hasPoorOrSlight = false;

    evals.forEach((je) => {
      const prev = this.jointStates.get(je.jointKey) || {
        lastStatus: 'Good' as JointStatus,
        lastSpokenTimestamp: 0,
      };

      const status = je.status;

      if (status === 'Poor' || status === 'Slight') {
        hasPoorOrSlight = true;
        this.flaggedJoints.add(je.jointKey);

        const statusDegraded =
          (prev.lastStatus === 'Good' && (status === 'Slight' || status === 'Poor')) ||
          (prev.lastStatus === 'Slight' && status === 'Poor');

        const cooldownElapsed = now - prev.lastSpokenTimestamp >= 13000;

        if (statusDegraded || cooldownElapsed) {
          candidates.push({
            joint: je,
            isTransition: statusDegraded,
            severity: status === 'Poor' ? 2 : 1,
          });
        }
      } else if (status === 'Good') {
        if (this.flaggedJoints.has(je.jointKey) && prev.lastStatus !== 'Good') {
          if (now - this.lastPositiveTime > 15000) {
            const displayName = mirrorJointLabel(je.jointKey);
            this.speak(`Nice correction on your ${displayName.toLowerCase()}!`);
            this.lastPositiveTime = now;
            this.flaggedJoints.delete(je.jointKey);
          }
        }
      }

      this.jointStates.set(je.jointKey, {
        lastStatus: status,
        lastSpokenTimestamp: prev.lastSpokenTimestamp,
      });
    });

    // Sustained good posture praise
    if (!hasPoorOrSlight && overallScore !== null && overallScore >= 85) {
      if (!this.goodHoldStartTime) {
        this.goodHoldStartTime = now;
      } else if (now - this.goodHoldStartTime >= 8000) {
        if (now - this.lastPositiveTime >= 20000) {
          this.speak('Beautiful form! Hold steady and breathe deeply.');
          this.lastPositiveTime = now;
          this.goodHoldStartTime = now;
        }
      }
    } else {
      this.goodHoldStartTime = null;
    }

    // Pick single most significant candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.isTransition !== b.isTransition) return a.isTransition ? -1 : 1;
        if (a.severity !== b.severity) return b.severity - a.severity;
        return b.joint.deviation - a.joint.deviation;
      });

      const chosen = candidates[0];
      const displayKey = mirrorJointLabel(chosen.joint.jointKey);
      const tpl = JOINT_FEEDBACK_TEMPLATES[chosen.joint.jointKey];
      let phrase = '';

      if (tpl) {
        const list = chosen.joint.status === 'Poor' ? tpl.poor : tpl.slight;
        phrase = list[Math.floor(Math.random() * list.length)];
      } else {
        phrase = `Adjust your ${displayKey.toLowerCase()}`;
      }

      this.speak(phrase);

      // BUG #12 FIX: Update cooldown for ALL candidates considered, not just chosen
      for (const candidate of candidates) {
        this.jointStates.set(candidate.joint.jointKey, {
          lastStatus: candidate.joint.status,
          lastSpokenTimestamp: now,
        });
      }
    }
  }
}

export const voiceCoach = new VoiceCoachService();
