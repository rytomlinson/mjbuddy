import type { TileCode } from 'common';
import type { ExposedMeld } from '../slices/handSlice';

export interface SavedHand {
  id: string;
  name: string;
  tiles: TileCode[];
  drawnTile: TileCode | null;
  exposedMelds: ExposedMeld[];
  savedAt: number; // timestamp
}

const STORAGE_KEY = 'mjbuddy_saved_hands';
const MAX_SAVED_HANDS = 10;

/**
 * Load all saved hands from localStorage
 */
export function loadSavedHands(): SavedHand[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save a hand to localStorage
 */
export function saveHand(
  name: string,
  tiles: TileCode[],
  drawnTile: TileCode | null,
  exposedMelds: ExposedMeld[]
): SavedHand {
  const hands = loadSavedHands();

  const newHand: SavedHand = {
    id: crypto.randomUUID(),
    name: name || `Hand ${hands.length + 1}`,
    tiles,
    drawnTile,
    exposedMelds,
    savedAt: Date.now(),
  };

  // Add to beginning of list
  hands.unshift(newHand);

  // Keep only the most recent hands
  const trimmed = hands.slice(0, MAX_SAVED_HANDS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return newHand;
}

/**
 * Delete a saved hand by ID
 */
export function deleteSavedHand(id: string): void {
  const hands = loadSavedHands();
  const filtered = hands.filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all saved hands
 */
export function clearAllSavedHands(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Format a timestamp for display
 */
export function formatSavedDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
