import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiDollarSign, FiTag, FiGlobe, FiBarChart2 } from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import { publicApi } from '../../api/publicApi';
import useAuthStore from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const AddCourse = () => {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await publicApi.getCategories();
        console.log('Categories API response:', response);
        console.log('Categories response.data:', response.data);
        
        // Handle both paginated and non-paginated responses
        let categoriesData = [];
        
        // Check if response has results (paginated)
        if (response.data && Array.isArray(response.data.results)) {
          categoriesData = response.data.results;
        } 
        // Check if response.data is directly an array (non-paginated)
        else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        }
        // Fallback: try to extract from nested structure
        else if (response.data && typeof response.data === 'object') {
          // Try common pagination keys
          if (Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          } else if (Array.isArray(response.data.items)) {
            categoriesData = response.data.items;
          }
        }
        
        console.log('Final parsed categories:', categoriesData);
        console.log('Categories count:', categoriesData.length);
        
        if (categoriesData.length === 0) {
          console.warn('No categories found in response');
        }
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check token before submitting
      const { accessToken } = useAuthStore.getState();
      console.log('📝 Creating course - Token check:', {
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : 'null',
        formData: formData
      });

      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      };
      
      console.log('📤 Sending course data:', data);
      const response = await teacherApi.createCourse(data);
      console.log('✅ Course created successfully:', response.data);
      
      Swal.fire('Success', 'Course created successfully!', 'success');
      navigate('/teacher/courses');
    } catch (error) {
      console.error('❌ Error creating course:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      Swal.fire('Error', error.response?.data?.error || error.response?.data?.detail || 'Failed to create course', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="px-6">
        <div className="max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Add New Course
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new course and start teaching students around the world
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiBook className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Course Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Complete Web Development Bootcamp"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiBook className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Course Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="8"
                      placeholder="Describe what students will learn in this course, what skills they'll gain, and what makes this course unique..."
                      required
                      style={{ minHeight: '180px' }}
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Provide a detailed description of your course content and learning outcomes
                    </p>
                  </div>
                </div>

                {/* Right Column - Metadata */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiTag className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg appearance-none cursor-pointer hover:border-indigo-400"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiBarChart2 className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Course Level
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg appearance-none cursor-pointer hover:border-indigo-400"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiDollarSign className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Discount Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiDollarSign className="inline mr-2 text-green-600 dark:text-green-400" />
                      Discount Price <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                      name="discount_price"
                      value={formData.discount_price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    {formData.discount_price && formData.price && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        Save ${(parseFloat(formData.price) - parseFloat(formData.discount_price)).toFixed(2)}!
                      </p>
                    )}
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiGlobe className="inline mr-2 text-indigo-600 dark:text-indigo-400" />
                      Language <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-lg"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="e.g., English, Vietnamese"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Course...</span>
                    </>
                  ) : (
                    <>
                      <FiBook className="text-xl" />
                      <span>Create Course</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/teacher/courses')}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
