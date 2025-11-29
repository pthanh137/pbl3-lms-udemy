import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

/**
 * Reusable StarRating component
 * @param {number} rating - Current rating (0-5)
 * @param {function} onRatingChange - Callback when rating changes (only in interactive mode)
 * @param {boolean} readOnly - If true, stars are not clickable
 * @param {number} size - Size of stars (default: 24)
 * @param {boolean} showLabel - Show rating label (e.g., "Excellent")
 */
const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readOnly = false, 
  size = 24,
  showLabel = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (star) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (!readOnly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Kém',
      2: 'Tệ',
      3: 'Tốt',
      4: 'Rất tốt',
      5: 'Xuất sắc'
    };
    return labels[rating] || '';
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={`transition-all ${
              readOnly 
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
            style={{ fontSize: `${size}px` }}
          >
            <FiStar
              className={`${
                star <= displayRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {showLabel && rating > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {getRatingLabel(rating)}
        </span>
      )}
    </div>
  );
};

export default StarRating;


