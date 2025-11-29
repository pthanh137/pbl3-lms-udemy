import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiDownload, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { certificateApi } from '../../api/certificateApi';
import { showError } from '../../utils/toast';
import SkeletonBlock from '../../components/SkeletonBlock';

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await certificateApi.getCertificateDetail(id);
        setCertificate(response.data);
      } catch (error) {
        console.error('Error fetching certificate:', error);
        showError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    // Open print dialog for PDF download
    window.print();
  };

  if (loading) {
    return <SkeletonBlock />;
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Certificate not found</p>
          <button
            onClick={() => navigate('/student/certificates')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/certificates')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Certificates</span>
        </button>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Certificate Card - Print Friendly */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-4 border-yellow-400 dark:border-yellow-600 overflow-hidden print:shadow-none print:border-0">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative z-10"
              >
                <FiAward className="text-8xl text-white mx-auto mb-4 drop-shadow-lg" />
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
                  Certificate of Completion
                </h1>
                <p className="text-xl text-white/90">This is to certify that</p>
              </motion.div>
            </div>

            {/* Certificate Body */}
            <div className="p-12 text-center">
              {/* Student Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {certificate.student_name}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {certificate.student_email}
                </p>
              </motion.div>

              {/* Completion Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                  has successfully completed the course
                </p>
                <div className="inline-block px-6 py-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <h3 className="text-3xl md:text-4xl font-bold text-indigo-900 dark:text-indigo-100">
                    {certificate.course_title}
                  </h3>
                </div>
              </motion.div>

              {/* Course Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 space-y-3"
              >
                {certificate.course_level && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Level: <span className="font-semibold">{certificate.course_level}</span>
                  </p>
                )}
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Instructor: <span className="font-semibold">{certificate.teacher_name}</span>
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Date of Completion: <span className="font-semibold">{formatDate(certificate.issued_at)}</span>
                </p>
              </motion.div>

              {/* Certificate Code */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Certificate Code
                </p>
                <p className="text-lg font-mono font-semibold text-gray-700 dark:text-gray-300">
                  {certificate.code}
                </p>
                {certificate.is_valid && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                    <FiCheck />
                    Verified Certificate
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Action Buttons - Hidden in Print */}
          <div className="mt-8 flex items-center justify-center gap-4 print:hidden">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <FiDownload />
              Download as PDF
            </button>
            <button
              onClick={() => navigate('/student/certificates')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
            >
              <FiArrowLeft />
              Back to Certificates
            </button>
          </div>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
          .print\\:border-0 {
            border: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDetail;


