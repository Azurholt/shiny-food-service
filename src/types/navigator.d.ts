// src/types/navigator.d.ts
export interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}