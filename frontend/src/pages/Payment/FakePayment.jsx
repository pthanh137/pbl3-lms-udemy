import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiX, FiCreditCard, FiLock } from 'react-icons/fi';
import { paymentApi } from '../../api/paymentApi';
import { showError } from '../../utils/toast';
import SkeletonBlock from '../../components/SkeletonBlock';

const FakePayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        const response = await paymentApi.getStatus(orderId);
        setOrderInfo(response.data);
        
        // If already paid, redirect to status page
        if (response.data.status === 'paid') {
          navigate(`/payment/status/${orderId}`);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        showError('Failed to load order information');
      }
    };
    fetchOrderInfo();
  }, [orderId, navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await paymentApi.fakeConfirm(orderId);
      navigate(`/payment/status/${orderId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      showError(error.response?.data?.error || 'Failed to confirm payment');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!orderInfo) {
    return <SkeletonBlock />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FiCreditCard className="text-4xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Mock Payment Gateway</h1>
            <p className="text-indigo-100">This is a simulated payment system for testing</p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Course:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {orderInfo.course_title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    #{orderInfo.order_id}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-4">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${orderInfo.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FiLock className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Secure Mock Payment
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    This is a test payment system. No real money will be charged. 
                    Click "Confirm Payment" to simulate a successful transaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <FiX />
                Cancel Payment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Confirm Payment
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FakePayment;

