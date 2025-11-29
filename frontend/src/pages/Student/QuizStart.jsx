import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiClock, FiTarget, FiEye } from 'react-icons/fi';
import { studentApi } from '../../api/studentApi';
import SkeletonBlock from '../../components/SkeletonBlock';

const QuizStart = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz details
        const quizResponse = await studentApi.getQuiz(quizId);
        setQuiz(quizResponse.data);

        // Fetch attempts to check if quiz was already taken
        try {
          const attemptsResponse = await studentApi.getQuizAttempts();
          const attempts = attemptsResponse.data.results || attemptsResponse.data || [];
          // Find attempt for this quiz
          const quizAttempt = attempts.find(att => att.quiz === parseInt(quizId));
          if (quizAttempt) {
            setAttempt(quizAttempt);
          }
        } catch (error) {
          console.error('Error fetching attempts:', error);
          // If error, assume no attempts
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  const handleStart = () => {
    navigate(`/student/quiz/${quizId}/take`);
  };

  const handleViewResult = () => {
    // Navigate to result page with attempt data
    navigate(`/student/quiz/${quizId}/result`, {
      state: {
        result: {
          score: attempt.score,
          passed: attempt.passed,
          correct_answers: attempt.correct_answers || 0,
          total_questions: quiz?.questions?.length || 0,
        }
      }
    });
  };

  if (loading) {
    return <SkeletonBlock />;
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy bài kiểm tra</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTarget className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">{quiz.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <FiTarget className="text-indigo-600 dark:text-indigo-400 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Điểm đạt</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quiz.pass_mark}%
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <FiPlay className="text-purple-600 dark:text-purple-400 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số câu hỏi</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {quiz.questions?.length || 0}
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <FiClock className="text-pink-600 dark:text-pink-400 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">Không giới hạn</p>
              </div>
            </div>

            {attempt ? (
              <>
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                    <strong>Bạn đã hoàn thành bài kiểm tra này!</strong>
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Điểm số: <strong className="text-indigo-600 dark:text-indigo-400">{attempt.score.toFixed(1)}%</strong>
                    </span>
                    <span className={`px-3 py-1 rounded-full font-semibold ${
                      attempt.passed 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {attempt.passed ? 'Đã đạt' : 'Chưa đạt'}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewResult}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiEye className="text-xl" />
                  <span>Xem kết quả</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FiPlay className="text-xl" />
                <span>Bắt đầu làm bài</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizStart;
