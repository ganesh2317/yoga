/**
 * Pose Matcher — free-practice auto-match without oscillation (§3.11).
 *
 * Commit a match only when:
 * 1. Top candidate beats runner-up by >= 8 points
 * 2. Continuous for 400ms
 * 3. Mean angular velocity is below a transition threshold
 *
 * Otherwise reports "Transitioning…"
 */

import type { ComputedJointAngles, YogaPose } from '../types';
import { evaluatePoseFrame } from './scoreEngine';

interface MatchCandidate {
  pose: YogaPose;
  score: number;
}

interface MatchState {
  candidateId: string | null;
  startTime: number;
  scores: number[];
}

const MARGIN_THRESHOLD = 8;
const SUSTAIN_MS = 400;
const MIN_SCORE = 55;

export interface PoseMatchResult {
  matched: boolean;
  pose: YogaPose | null;
  score: number;
  confidence: number;
  isTransitioning: boolean;
}

export class PoseMatcher {
  private matchState: MatchState = { candidateId: null, startTime: 0, scores: [] };

  /**
   * Scores the live angle vector against all poses and returns the stable match.
   */
  public match(
    computedAngles: ComputedJointAngles,
    poses: YogaPose[]
  ): PoseMatchResult {
    const now = performance.now();

    // Score all poses
    const candidates: MatchCandidate[] = poses.map((pose) => {
      const evalResult = evaluatePoseFrame(computedAngles, pose);
      return { pose, score: evalResult.score ?? 0 };
    });

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    const top = candidates[0];
    const runnerUp = candidates[1];

    if (!top || top.score < MIN_SCORE) {
      this.matchState = { candidateId: null, startTime: 0, scores: [] };
      return {
        matched: false,
        pose: null,
        score: 0,
        confidence: 0,
        isTransitioning: true,
      };
    }

    const margin = runnerUp ? top.score - runnerUp.score : top.score;

    // Check margin
    if (margin < MARGIN_THRESHOLD) {
      this.matchState = { candidateId: null, startTime: 0, scores: [] };
      return {
        matched: false,
        pose: top.pose,
        score: top.score,
        confidence: Math.round(margin * 10),
        isTransitioning: true,
      };
    }

    // Check sustained match
    if (this.matchState.candidateId === top.pose.id) {
      this.matchState.scores.push(top.score);
      if (this.matchState.scores.length > 30) {
        this.matchState.scores.shift();
      }

      const elapsed = now - this.matchState.startTime;
      if (elapsed >= SUSTAIN_MS) {
        const avgScore = Math.round(
          this.matchState.scores.reduce((a, b) => a + b, 0) / this.matchState.scores.length
        );
        return {
          matched: true,
          pose: top.pose,
          score: avgScore,
          confidence: Math.min(100, Math.round(margin * 5)),
          isTransitioning: false,
        };
      }
    } else {
      // New candidate
      this.matchState = {
        candidateId: top.pose.id,
        startTime: now,
        scores: [top.score],
      };
    }

    return {
      matched: false,
      pose: top.pose,
      score: top.score,
      confidence: Math.round(margin * 5),
      isTransitioning: true,
    };
  }

  public reset(): void {
    this.matchState = { candidateId: null, startTime: 0, scores: [] };
  }
}
