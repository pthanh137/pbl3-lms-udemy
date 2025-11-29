import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiSearch, FiEye, FiCalendar, FiUser } from 'react-icons/fi';
import { certificateApi } from '../../api/certificateApi';
import { showError } from '../../utils/toast';
import SkeletonCard from '../../components/SkeletonCard';

const MyCertificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await certificateApi.getMyCertificates();
        const certs = response.data.results || [];
        setCertificates(certs);
        setFilteredCertificates(certs);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        showError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCertificates(certificates);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = certificates.filter(
      (cert) =>
        cert.course_title?.toLowerCase().includes(query) ||
        cert.code?.toLowerCase().includes(query) ||
        cert.teacher_name?.toLowerCase().includes(query)
    );
    setFilteredCertificates(filtered);
  }, [searchQuery, certificates]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <FiAward className="text-yellow-500" />
                My Certificates
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your course completion certificates
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course name, code, or teacher..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <FiAward className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {certificates.length === 0
                ? "You don't have any certificates yet"
                : 'No certificates found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {certificates.length === 0
                ? 'Complete courses to earn certificates'
                : 'Try adjusting your search query'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-yellow-200 dark:border-yellow-800 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-center">
                  <FiAward className="text-5xl text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">Certificate of Completion</h3>
                </div>

                {/* Certificate Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {certificate.course_title}
                  </h4>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiUser className="text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium">Teacher:</span>
                      <span>{certificate.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiCalendar className="text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium">Issued:</span>
                      <span>{formatDate(certificate.issued_at)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Code: {certificate.code}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/student/certificates/${certificate.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    <FiEye />
                    View Certificate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;


