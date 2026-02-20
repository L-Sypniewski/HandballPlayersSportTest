/**
 * Microsoft Clarity analytics utility
 * Provides type-safe event tracking with fallback if Clarity is not loaded
 */

// Extend Window interface to include Clarity
declare global {
  interface Window {
    clarity?: {
      (...args: unknown[]): void;
      q?: unknown[];
    };
  }
}

/**
 * Track a custom event in Microsoft Clarity
 * @param eventName - Name of the event to track (use snake_case for consistency)
 * @param metadata - Optional additional data to attach to the event
 */
export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    if (metadata) {
      window.clarity('event', eventName, metadata);
    } else {
      window.clarity('event', eventName);
    }
  }
}

/**
 * Set custom user identifier in Clarity
 * @param userId - Unique user identifier
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('set', 'userId', userId);
  }
}

/**
 * Set custom session attribute in Clarity
 * @param key - Attribute name
 * @param value - Attribute value
 */
export function setAttribute(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('set', key, value);
  }
}

// Predefined event names for this application
export const AnalyticsEvents = {
  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  FILE_CREATE: 'file_create',
  FILE_SELECT: 'file_select',
  FILE_DELETE: 'file_delete',

  // Group operations
  GROUP_ADD: 'group_add',
  GROUP_REMOVE: 'group_remove',
  GROUP_RENAME: 'group_rename',

  // Tour
  TOUR_START: 'tour_start',
  TOUR_COMPLETE: 'tour_complete',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
