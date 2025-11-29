import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiDollarSign,
  FiTag,
  FiGlobe,
  FiBarChart2,
  FiArrowLeft,
  FiSave,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import { publicApi } from '../../api/publicApi';
import Swal from 'sweetalert2';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'Beginner',
    price: '',
    discount_price: '',
    language: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        setError('Course ID is required');
        return;
      }

      try {
        setError(null);
        const [courseRes, categoriesRes] = await Promise.all([
          teacherApi.getCourse(id),
          publicApi.getCategories(),
        ]);
        
        const course = courseRes.data;
        console.log('Course data received:', course); // Debug
        
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category_id: course.category?.id || course.category || '',
          level: course.level || 'Beginner',
          price: course.price?.toString() || '',
          discount_price: course.discount_price?.toString() || '',
          language: course.language || '',
        });
        
        // Handle categories response
        let categoriesData = [];
        if (Array.isArray(categoriesRes.data?.results)) {
          categoriesData = categoriesRes.data.results;
        } else if (Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        } else if (categoriesRes.data && typeof categoriesRes.data === 'object') {
          // Try to find array in response
          const potentialArray = Object.values(categoriesRes.data).find(Array.isArray);
          if (potentialArray) {
            categoriesData = potentialArray;
          }
        }
        console.log('Categories data:', categoriesData); // Debug
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to load course';
        setError(errorMessage);
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      };
      await teacherApi.updateCourse(id, data);
      Swal.fire('Success', 'Course updated successfully!', 'success');
      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      Swal.fire('Error', error.response?.data?.error || error.response?.data?.detail || 'Failed to update course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  // Show error only if we have an error AND no course data loaded
  if (error && !formData.title && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Course
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/courses')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mx-auto"
            >
              <FiArrowLeft className="text-xl" />
              Back to Courses
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/teacher/courses')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Courses</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Update your course information
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FiBook className="text-indigo-600" />
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                placeholder="Enter course title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FiBook className="text-indigo-600" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                placeholder="Describe what students will learn in this course..."
                required
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiTag className="text-indigo-600" />
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg appearance-none cursor-pointer hover:border-indigo-400"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiBarChart2 className="text-indigo-600" />
                  Course Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg appearance-none cursor-pointer hover:border-indigo-400"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiDollarSign className="text-indigo-600" />
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Discount Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiDollarSign className="text-indigo-600" />
                  Discount Price <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FiGlobe className="text-indigo-600" />
                Language <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                placeholder="e.g., English, Vietnamese, etc."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="text-xl" />
                {submitting ? 'Updating...' : 'Update Course'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/teacher/courses')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditCourse;
