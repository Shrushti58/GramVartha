/**
 * Formatting Utilities
 */

/**
 * Format view count
 */
export function formatViews(views?: number): string {
  if (!views || views === 0) return '0';
  
  if (views < 1000) {
    return views.toString();
  }
  
  if (views < 1000000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  
  return `${(views / 1000000).toFixed(1)}M`;
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format long date
 */
export function formatLongDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if file is an image
 */
export function isImage(filename?: string): boolean {
  if (!filename) return false;
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const extension = getFileExtension(filename);
  
  return imageExtensions.includes(extension);
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  
  return parts.pop()?.toLowerCase() || '';
}

/**
 * Get file extension display text
 */
export function getFileExtensionDisplay(filename: string): string {
  const ext = getFileExtension(filename);
  return ext.toUpperCase();
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
}