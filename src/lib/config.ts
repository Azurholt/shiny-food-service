export const BUSYNESS_THRESHOLDS = {
  LOW_MAX: 2,
  MEDIUM_MAX: 7,
} as const;

// Boundary behavior: 0-2 active orders = low, 3-7 = medium, 8+ = high.
export function getBusynessLevel(activeOrders: number): 'low' | 'medium' | 'high' {
  if (activeOrders <= BUSYNESS_THRESHOLDS.LOW_MAX) return 'low';
  if (activeOrders <= BUSYNESS_THRESHOLDS.MEDIUM_MAX) return 'medium';
  return 'high';
}
