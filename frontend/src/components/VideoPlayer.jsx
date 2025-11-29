import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { FiExternalLink, FiVideo } from 'react-icons/fi';
import { isYouTubeUrl, isMp4Url, getYouTubeEmbedUrl } from '../utils/videoUtils';

/**
 * VideoPlayer Component
 * Supports both YouTube and MP4 videos with progress tracking
 * Uses refs ONLY - NO state updates during playback to prevent stuttering
 */
const VideoPlayer = memo(({
  videoUrl,
  durationSeconds = null,
  initialProgress = 0,
  onProgress,
  onEnded,
  onError,
  className = '',
}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastCurrentTimeRef = useRef(0);
  const lastDurationRef = useRef(0);
  const lastApiUpdateRef = useRef(0);
  const isPausedRef = useRef(true);
  const hasRestoredProgressRef = useRef(false);
  // Generate unique container ID based on videoUrl to ensure each chapter gets a unique player
  // Use useMemo to generate ID once per videoUrl
  const youtubeContainerId = useMemo(() => {
    const videoIdHash = videoUrl ? videoUrl.split('/').pop().split('?')[0].substring(0, 10) : '';
    return `youtube-player-${videoIdHash}-${Math.random().toString(36).substr(2, 9)}`;
  }, [videoUrl]);
  
  const youtubeContainerIdRef = useRef(youtubeContainerId);
  
  // Update container ID ref when videoUrl changes
  useEffect(() => {
    youtubeContainerIdRef.current = youtubeContainerId;
  }, [youtubeContainerId]);
  
  // Stable refs for callbacks
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  
  // Update callback refs when they change (but don't cause re-render)
  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
    onErrorRef.current = onError;
  }, [onProgress, onEnded, onError]);

  // Memoize video URL to prevent src changes
  const absoluteUrl = useMemo(() => {
    if (!videoUrl || typeof videoUrl !== 'string') return null;
    
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) return null;
    
    // If it's already an absolute URL, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If it's a relative path (starts with /media/), make it absolute
    if (trimmedUrl.startsWith('/media/')) {
      return `http://127.0.0.1:8000${trimmedUrl}`;
    }
    
    // If it doesn't start with /, assume it's relative to media root
    if (!trimmedUrl.startsWith('/')) {
      return `http://127.0.0.1:8000/media/${trimmedUrl}`;
    }
    
    return trimmedUrl;
  }, [videoUrl]);

  // Memoize video type
  const videoType = useMemo(() => {
    return isYouTubeUrl(videoUrl) ? 'youtube' : isMp4Url(videoUrl) ? 'mp4' : 'unknown';
  }, [videoUrl]);

  // Reset progress tracking refs when video URL changes
  useEffect(() => {
    hasRestoredProgressRef.current = false;
    lastCurrentTimeRef.current = 0;
    lastDurationRef.current = 0;
    lastApiUpdateRef.current = 0;
    isPausedRef.current = true;
  }, [videoUrl]);

  // MP4 Progress Tracking - Use refs ONLY, NO state updates
  useEffect(() => {
    if (videoType !== 'mp4') return;

    const video = videoRef.current;
    if (!video) return;

    // Restore progress ONCE when video loads (only set currentTime once)
    const restoreProgress = () => {
      if (initialProgress > 0 && !hasRestoredProgressRef.current && video.readyState >= 2) {
        video.currentTime = initialProgress;
        hasRestoredProgressRef.current = true;
        lastCurrentTimeRef.current = initialProgress;
      }
    };

    // Track play/pause state in refs only
    const handlePlay = () => {
      isPausedRef.current = false;
    };

    const handlePause = () => {
      isPausedRef.current = true;
    };

    const handleEnded = () => {
      isPausedRef.current = true;
      const duration = lastDurationRef.current || durationSeconds || 0;
      lastCurrentTimeRef.current = duration;
      
      // Call callback via ref (no state update)
      if (onEndedRef.current) {
        onEndedRef.current();
      }
      
      // Send final progress update via ref
      if (onProgressRef.current) {
        onProgressRef.current({
          currentTime: duration,
          duration,
          progressPercent: 100,
          completed: true
        });
      }
    };

    const handleError = () => {
      setError('Không thể tải video MP4');
      setIsLoading(false);
      if (onErrorRef.current) {
        onErrorRef.current('MP4 video failed to load');
      }
    };

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setError(null);
      lastDurationRef.current = video.duration || durationSeconds || 0;
      
      // Restore progress after metadata loads
      restoreProgress();
    };

    // Store currentTime in ref ONLY (NO setState, NO onProgress call)
    const handleTimeUpdate = () => {
      if (video && !video.paused) {
        lastCurrentTimeRef.current = Math.floor(video.currentTime || 0);
        if (!lastDurationRef.current && video.duration) {
          lastDurationRef.current = video.duration;
        }
      }
    };

    // 5-second interval to send progress (only when playing, NO state updates)
    progressIntervalRef.current = setInterval(() => {
      if (!video || video.paused || isPausedRef.current) {
        return; // Don't send progress if paused
      }

      const currentTime = lastCurrentTimeRef.current;
      const duration = lastDurationRef.current || durationSeconds || 0;
      const now = Date.now();
      
      // Only send if enough time has passed (5 seconds) and video is playing
      if (currentTime > 0 && duration > 0 && (now - lastApiUpdateRef.current > 5000)) {
        lastApiUpdateRef.current = now;
        
        // Call via ref - NO state updates, NO re-renders
        if (onProgressRef.current) {
          const progressPercent = (currentTime / duration) * 100;
          onProgressRef.current({
            currentTime,
            duration,
            progressPercent,
            completed: currentTime >= duration * 0.95
          });
        }
      }
    }, 5000);

    // Restore progress when ready
    if (video.readyState >= 2) {
      restoreProgress();
    }

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', restoreProgress);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', restoreProgress);
    };
  }, [videoType, videoUrl, initialProgress, durationSeconds]);

  // YouTube Progress Tracking using IFrame API - Use refs ONLY, NO state updates
  const isPlayerReadyRef = useRef(false);
  const youtubePlayerStateRef = useRef(null); // Track player state (PLAYING, PAUSED, etc.)

  useEffect(() => {
    if (videoType !== 'youtube') return;

    // Reset all refs when videoUrl changes (new chapter)
    hasRestoredProgressRef.current = false;
    lastCurrentTimeRef.current = 0;
    lastDurationRef.current = 0;
    lastApiUpdateRef.current = 0;
    isPausedRef.current = true;
    isPlayerReadyRef.current = false;
    youtubePlayerStateRef.current = null;

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Destroy old player if exists
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === 'function') {
      try {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      } catch (e) {
        console.log('Error destroying old YouTube player:', e);
      }
    }

    let player = null;

    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else {
        // Create script tag if it doesn't exist
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        
        // Set up callback
        window.onYouTubeIframeAPIReady = initializePlayer;
      }
    };

    const initializePlayer = () => {
      if (!youtubeIframeRef.current) {
        // Wait a bit for the ref to be set
        setTimeout(initializePlayer, 100);
        return;
      }

      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (!embedUrl) {
        setError('Không thể tải video YouTube');
        setIsLoading(false);
        return;
      }

      // Extract video ID from embed URL or directly from videoUrl
      let videoId = embedUrl.split('/embed/')[1]?.split('?')[0];
      if (!videoId) {
        // Try to extract from original URL
        const { extractYouTubeVideoId } = require('../utils/videoUtils');
        videoId = extractYouTubeVideoId(videoUrl);
      }
      
      if (!videoId) {
        setError('Không thể tải video YouTube');
        setIsLoading(false);
        return;
      }

      try {
        // Set the container ID
        if (youtubeIframeRef.current) {
          youtubeIframeRef.current.id = youtubeContainerIdRef.current;
        }
        
        player = new window.YT.Player(youtubeContainerIdRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              // Store player instance in ref
              youtubePlayerRef.current = event.target;
              isPlayerReadyRef.current = true;
              setIsLoading(false);
              setError(null);
              
              // Get duration and store in ref (only after ready)
              try {
                const duration = Math.floor(event.target.getDuration() || durationSeconds || 0);
                if (duration > 0 && !isNaN(duration)) {
                  lastDurationRef.current = duration;
                }
              } catch (e) {
                // Duration might not be available immediately, try again later
                setTimeout(() => {
                  try {
                    if (youtubePlayerRef.current) {
                      const duration = Math.floor(youtubePlayerRef.current.getDuration() || durationSeconds || 0);
                      if (duration > 0 && !isNaN(duration)) {
                        lastDurationRef.current = duration;
                      }
                    }
                  } catch (err) {
                    console.log('Could not get duration:', err);
                  }
                }, 1000);
              }
              
              // Seek to initial progress ONCE (only set once)
              if (initialProgress > 0 && !hasRestoredProgressRef.current) {
                try {
                  event.target.seekTo(initialProgress, true);
                  lastCurrentTimeRef.current = initialProgress;
                  hasRestoredProgressRef.current = true;
                } catch (e) {
                  console.log('Could not seek to position:', e);
                }
              }

              // Start progress interval ONLY after player is ready
              // This interval runs independently and does NOT cause re-renders
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              
              progressIntervalRef.current = setInterval(() => {
                // Only proceed if player is ready
                if (!youtubePlayerRef.current || !isPlayerReadyRef.current) {
                  return;
                }

                try {
                  // Check player state - only update if PLAYING (state 1)
                  const playerState = youtubePlayerRef.current.getPlayerState();
                  youtubePlayerStateRef.current = playerState;

                  // Only track progress if player is PLAYING
                  if (playerState !== window.YT.PlayerState.PLAYING) {
                    isPausedRef.current = true;
                    return;
                  }

                  isPausedRef.current = false;

                  // Get current time and duration (only if player is ready)
                  const currentTime = Math.floor(youtubePlayerRef.current.getCurrentTime() || 0);
                  let duration = lastDurationRef.current;
                  
                  // Try to get duration if not stored yet
                  if (!duration || duration === 0) {
                    try {
                      duration = Math.floor(youtubePlayerRef.current.getDuration() || durationSeconds || 0);
                      if (duration > 0 && !isNaN(duration)) {
                        lastDurationRef.current = duration;
                      } else {
                        return; // Skip if duration is invalid
                      }
                    } catch (e) {
                      return; // Skip if can't get duration
                    }
                  }

                  // Skip if duration is too short or invalid
                  if (duration < 5 || isNaN(duration)) {
                    return;
                  }

                  const now = Date.now();
                  
                  // Only send if enough time has passed (5 seconds) and video is playing
                  if (currentTime > 0 && duration > 0 && (now - lastApiUpdateRef.current > 5000)) {
                    lastApiUpdateRef.current = now;
                    lastCurrentTimeRef.current = currentTime;
                    
                    // Call via ref - NO state updates, NO re-renders, NO video.currentTime changes
                    if (onProgressRef.current) {
                      const progressPercent = (currentTime / duration) * 100;
                      onProgressRef.current({
                        currentTime,
                        duration,
                        progressPercent,
                        completed: currentTime >= duration * 0.95
                      });
                    }
                  }
                } catch (e) {
                  // Silently handle errors - don't break the interval
                  console.log('Error getting YouTube player time:', e);
                }
              }, 5000);
            },
            onStateChange: (event) => {
              // Track play/pause state in refs ONLY (NO setState)
              youtubePlayerStateRef.current = event.data;
              
              if (event.data === window.YT.PlayerState.PLAYING) {
                isPausedRef.current = false;
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                isPausedRef.current = true;
              } else if (event.data === window.YT.PlayerState.ENDED) {
                isPausedRef.current = true;
                
                // Video ended - clear interval
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                
                // Call callbacks via refs (NO state updates)
                if (youtubePlayerRef.current && isPlayerReadyRef.current) {
                  try {
                    const duration = lastDurationRef.current || durationSeconds || 0;
                    if (duration > 0) {
                      lastCurrentTimeRef.current = duration;
                      
                      if (onProgressRef.current) {
                        onProgressRef.current({
                          currentTime: duration,
                          duration,
                          progressPercent: 100,
                          completed: true
                        });
                      }
                    }
                  } catch (e) {
                    console.log('Error on video end:', e);
                  }
                }
                
                if (onEndedRef.current) {
                  onEndedRef.current();
                }
              }
            },
            onError: (event) => {
              setError('Không thể tải video YouTube');
              setIsLoading(false);
              isPlayerReadyRef.current = false;
              if (onErrorRef.current) {
                onErrorRef.current('YouTube video failed to load');
              }
            }
          }
        });
      } catch (e) {
        console.error('Error creating YouTube player:', e);
        setError('Không thể tải video YouTube');
        setIsLoading(false);
        isPlayerReadyRef.current = false;
      }
    };

    loadYouTubeAPI();

    return () => {
      // Cleanup: destroy interval and player
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === 'function') {
        try {
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        } catch (e) {
          console.log('Error destroying YouTube player:', e);
        }
      }
      isPlayerReadyRef.current = false;
    };
  }, [videoType, videoUrl, initialProgress, durationSeconds]);

  // Render error state
  if (error) {
    return (
      <div className={`aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6 ${className}`}>
        <FiVideo className="text-4xl text-white/50 mb-4" />
        <p className="text-white text-center mb-4">{error}</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FiExternalLink />
          Mở video trong tab mới
        </a>
      </div>
    );
  }

  // Render MP4 video
  if (videoType === 'mp4' && absoluteUrl) {
    return (
      <div className={`w-full rounded-lg overflow-hidden bg-black relative ${className}`} style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={absoluteUrl || undefined}
          controls
          className="w-full h-full"
          onError={() => {
            setError('Không thể tải video MP4');
            setIsLoading(false);
            if (onErrorRef.current) {
              onErrorRef.current('MP4 video failed to load');
            }
          }}
          onLoadedMetadata={() => {
            setIsLoading(false);
            setError(null);
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">Đang tải video...</div>
          </div>
        )}
        <div className="absolute bottom-2 right-2" style={{ zIndex: 10, pointerEvents: 'auto' }}>
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <FiExternalLink />
            Tab mới
          </a>
        </div>
      </div>
    );
  }

  // Render YouTube video
  if (videoType === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    
    if (!embedUrl) {
      return (
        <div className={`aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6 ${className}`}>
          <FiVideo className="text-4xl text-white/50 mb-4" />
          <p className="text-white mb-4">Không thể tải video YouTube</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FiExternalLink />
            Mở trong tab mới
          </a>
        </div>
      );
    }

    return (
      <div className={`w-full rounded-lg overflow-hidden bg-black relative ${className}`} style={{ aspectRatio: '16/9' }}>
        <div ref={youtubeIframeRef} className="w-full h-full" style={{ minHeight: '400px' }} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-white">Đang tải video...</div>
          </div>
        )}
        <div className="absolute bottom-2 right-2" style={{ zIndex: 10, pointerEvents: 'auto' }}>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <FiExternalLink />
            Tab mới
          </a>
        </div>
      </div>
    );
  }

  // Unknown video type
  return (
    <div className={`aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6 ${className}`}>
      <FiVideo className="text-4xl text-white/50 mb-4" />
      <p className="text-white mb-4">Định dạng video không được hỗ trợ</p>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <FiExternalLink />
        Mở video trong tab mới
      </a>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  // Callbacks (onProgress, onEnded, onError) are handled via refs, so they don't cause re-renders
  return (
    prevProps.videoUrl === nextProps.videoUrl &&
    prevProps.durationSeconds === nextProps.durationSeconds &&
    prevProps.initialProgress === nextProps.initialProgress &&
    prevProps.className === nextProps.className
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

