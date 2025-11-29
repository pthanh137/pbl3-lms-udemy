/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null
 */
export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Check if URL is a YouTube link
 * @param {string} url - Video URL
 * @returns {boolean}
 */
export const isYouTubeUrl = (url) => {
  return !!extractYouTubeVideoId(url);
};

/**
 * Check if URL is an MP4 file
 * @param {string} url - Video URL
 * @returns {boolean}
 */
export const isMp4Url = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('.mp4');
};

/**
 * Get video type (youtube, mp4, vimeo, other)
 * @param {string} url - Video URL
 * @returns {string|null}
 */
export const getVideoType = (url) => {
  if (!url) return null;
  
  if (isYouTubeUrl(url)) return 'youtube';
  if (isMp4Url(url)) return 'mp4';
  if (url.includes('vimeo.com')) return 'vimeo';
  
  return 'other';
};

/**
 * Get YouTube embed URL
 * @param {string} url - YouTube URL
 * @returns {string|null}
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};


