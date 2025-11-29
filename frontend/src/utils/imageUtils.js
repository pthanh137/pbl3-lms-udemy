/**
 * Get full image URL from backend
 * @param {string|null|undefined} imagePath - Image path from backend
 * @returns {string|null} Full image URL or null if no image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend base URL
  const baseUrl = 'http://127.0.0.1:8000';
  // Ensure path starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

