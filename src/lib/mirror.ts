/**
 * Mirror module — single source of truth for display mirroring (§3.6).
 *
 * Rules:
 * - Anatomy is NEVER flipped. MediaPipe left stays user's left for all geometry/cues.
 * - Only DISPLAY labels and CANVAS coordinates are mapped.
 * - Every on-screen/spoken "left/right" matches what the user sees in the mirror.
 */

/**
 * Whether the camera preview is horizontally mirrored.
 * Used by overlay canvas and label generation.
 */
export const IS_MIRRORED = true;

/**
 * Maps an anatomical X coordinate (0-1, left=0) to display X for mirrored preview.
 */
export function toDisplayX(x: number, isMirrored: boolean = IS_MIRRORED): number {
  return isMirrored ? 1 - x : x;
}

/**
 * Maps a display X coordinate back to anatomical X.
 */
export function toAnatomicalX(displayX: number, isMirrored: boolean = IS_MIRRORED): number {
  return isMirrored ? 1 - displayX : displayX;
}

/**
 * Returns the display label for a body side that matches what the user sees in the mirror.
 * In a mirrored view, the user's anatomical left appears on their right in the mirror.
 */
export function displaySideLabel(
  anatomicalSide: 'left' | 'right' | 'center',
  isMirrored: boolean = IS_MIRRORED
): string {
  if (anatomicalSide === 'center') return 'center';
  if (!isMirrored) return anatomicalSide;
  return anatomicalSide === 'left' ? 'right' : 'left';
}

/**
 * Returns the mirror-corrected side name for use in UI text and voice cues.
 * e.g. "Adjust your right knee" when the user's anatomical left knee is off
 * (because in the mirror, their left knee appears on the right side).
 */
export function mirrorJointLabel(jointKey: string, isMirrored: boolean = IS_MIRRORED): string {
  if (!isMirrored) return jointKey;

  if (jointKey.startsWith('left')) {
    return 'right' + jointKey.slice(4);
  }
  if (jointKey.startsWith('right')) {
    return 'left' + jointKey.slice(5);
  }
  return jointKey;
}
