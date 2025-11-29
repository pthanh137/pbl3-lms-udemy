import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiXCircle } from 'react-icons/fi';
import { studentApi } from '../../api/studentApi';
import SkeletonList from '../../components/SkeletonList';

const QuizAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await studentApi.getQuizAttempts();
        setAttempts(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            My Quiz Attempts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">View your quiz history and performance</p>
        </motion.div>

        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <FiAward className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No quiz attempts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {attempt.quiz}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {attempt.score}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    </div>
                    <div
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                        attempt.passed
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {attempt.passed ? (
                        <FiAward className="text-lg" />
                      ) : (
                        <FiXCircle className="text-lg" />
                      )}
                      <span className="font-semibold">{attempt.passed ? 'Passed' : 'Failed'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttempts;
