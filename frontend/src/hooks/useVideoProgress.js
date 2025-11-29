import { useState, useEffect, useRef, useCallback } from 'react';
import { studentApi } from '../api/studentApi';

/**
 * Hook for tracking video progress
 * Handles debouncing and automatic progress updates
 */
const useVideoProgress = (lessonId, durationSeconds = null) => {
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const updateTimeoutRef = useRef(null);
  const lastApiUpdateRef = useRef(0);
  
  // Reset state when lessonId changes
  useEffect(() => {
    setWatchedSeconds(0);
    setProgressPercent(0);
    setIsCompleted(false);
  }, [lessonId]);

  // Update progress (debounced API calls) - NO state updates during playback
  const updateProgress = useCallback(async (currentTime, duration, completed = false) => {
    if (!lessonId) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Throttle state updates to prevent excessive re-renders
    // Only update state every 2 seconds for UI display (not every progress update)
    const now = Date.now();
    const shouldUpdateState = completed || (now - lastApiUpdateRef.current > 2000);
    
    if (shouldUpdateState) {
      // Update local state for UI (throttled to 2 seconds)
      setWatchedSeconds(currentTime);
      if (duration > 0) {
        setProgressPercent(Math.min(100, Math.round((currentTime / duration) * 100)));
      }
      setIsCompleted(completed);
    }

    // Debounce API call (update every 5 seconds or immediately if completed)
    const shouldUpdateApi = completed || (now - lastApiUpdateRef.current > 5000);

    if (shouldUpdateApi) {
      updateTimeoutRef.current = setTimeout(async () => {
        try {
          await studentApi.updateLessonProgress(lessonId, currentTime, completed);
          lastApiUpdateRef.current = Date.now();
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }, completed ? 0 : 5000);
    }
  }, [lessonId]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    const duration = durationSeconds || 0;
    if (duration > 0) {
      updateProgress(duration, duration, true);
    }
  }, [durationSeconds, updateProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    watchedSeconds,
    progressPercent,
    isCompleted,
    updateProgress,
    handleVideoEnd,
    setWatchedSeconds,
    setProgressPercent,
    setIsCompleted,
  };
};

export default useVideoProgress;

