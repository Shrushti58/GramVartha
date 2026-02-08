/**
 * Local Storage Utilities
 * Manages bookmarks and local data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@bookmarked_notices';

/**
 * Get all bookmarked notice IDs
 */
export async function getBookmarks(): Promise<Set<string>> {
  try {
    const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (bookmarksJson) {
      const bookmarksArray = JSON.parse(bookmarksJson);
      return new Set(bookmarksArray);
    }
    return new Set();
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return new Set();
  }
}

/**
 * Save bookmarks
 */
export async function saveBookmarks(bookmarks: Set<string>): Promise<void> {
  try {
    const bookmarksArray = Array.from(bookmarks);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksArray));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}

/**
 * Add a bookmark
 */
export async function addBookmark(noticeId: string): Promise<void> {
  try {
    const bookmarks = await getBookmarks();
    bookmarks.add(noticeId);
    await saveBookmarks(bookmarks);
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(noticeId: string): Promise<void> {
  try {
    const bookmarks = await getBookmarks();
    bookmarks.delete(noticeId);
    await saveBookmarks(bookmarks);
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

/**
 * Toggle bookmark
 */
export async function toggleBookmark(noticeId: string): Promise<boolean> {
  try {
    const bookmarks = await getBookmarks();
    const isBookmarked = bookmarks.has(noticeId);
    
    if (isBookmarked) {
      bookmarks.delete(noticeId);
    } else {
      bookmarks.add(noticeId);
    }
    
    await saveBookmarks(bookmarks);
    return !isBookmarked;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
}

/**
 * Clear all bookmarks
 */
export async function clearBookmarks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
}