/**
 * Format price to Vietnamese Dong (VNĐ)
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string (e.g., "499.000 ₫")
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₫';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0 ₫';
  
  // Format with thousand separators
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};


