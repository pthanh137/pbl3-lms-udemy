import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { studentApi } from '../../api/studentApi';
import { showError, showWarning } from '../../utils/toast';
import SkeletonBlock from '../../components/SkeletonBlock';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await studentApi.getQuiz(quizId);
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        showError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      showWarning('Please answer at least one question');
      return;
    }

    setSubmitting(true);
    try {
      const response = await studentApi.submitQuiz(quizId, answers);
      navigate(`/student/quiz/${quizId}/result`, {
        state: { result: response.data },
      });
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonBlock />;
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Question {Object.keys(answers).length} of {quiz.questions?.length || 0} answered
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {quiz.questions?.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
                  {question.question_text}
                </h3>
              </div>
              <div className="space-y-3 ml-11">
                {question.options?.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerChange(question.id, option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500 dark:bg-indigo-400'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <FiCheckCircle className="text-white text-xs" />}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{option.option_text}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky bottom-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {Object.keys(answers).length} of {quiz.questions?.length || 0} questions answered
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
              <span>→</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
