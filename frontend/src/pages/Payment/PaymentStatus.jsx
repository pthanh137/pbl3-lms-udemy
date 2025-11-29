import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiPlay, FiArrowLeft } from 'react-icons/fi';
import { paymentApi } from '../../api/paymentApi';
import { showError } from '../../utils/toast';
import SkeletonBlock from '../../components/SkeletonBlock';

const PaymentStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await paymentApi.getStatus(orderId);
        setOrderStatus(response.data);
      } catch (error) {
        console.error('Error fetching payment status:', error);
        showError('Failed to load payment status');
      setOrderStatus({ status: 'failed' });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [orderId]);

  if (loading) {
    return <SkeletonBlock />;
  }

  if (!orderStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Unable to load payment status</p>
      </div>
    );
  }

  const handleStartLearning = () => {
    if (orderStatus.course_id) {
      navigate(`/student/course/${orderStatus.course_id}/content`);
    } else {
      navigate('/student/my-courses');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Status Content */}
          <div className="p-12 text-center">
            {orderStatus.status === 'paid' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheckCircle className="text-6xl text-green-600 dark:text-green-400" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Your payment has been confirmed.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You are now enrolled in: <span className="font-semibold">{orderStatus.course_title}</span>
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/student/my-courses')}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <FiArrowLeft />
                    My Courses
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartLearning}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <FiPlay />
                    Start Learning
                  </motion.button>
                </div>
              </>
            )}

            {orderStatus.status === 'pending' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiLoader className="text-6xl text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Payment Pending
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Your payment is being processed. Please wait...
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Refresh Status
                </motion.button>
              </>
            )}

            {orderStatus.status === 'failed' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiXCircle className="text-6xl text-red-600 dark:text-red-400" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Payment Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <FiArrowLeft />
                    Go Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/courses')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Browse Courses
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentStatus;


