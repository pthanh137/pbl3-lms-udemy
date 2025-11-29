import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiTrendingUp, FiBook, FiStar, FiUsers } from 'react-icons/fi';
import { publicApi } from '../../api/publicApi';
import useDebounce from '../../hooks/useDebounce';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import ReviewsCarousel from '../../components/home/ReviewsCarousel';
import TopInstructors from '../../components/home/TopInstructors';
import Categories from '../../components/home/Categories';
import PopularCourses from '../../components/home/PopularCourses';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getCourses({ ordering: '-total_enrollments' }), // Popular courses
        ]);
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
        setCourses(coursesRes.data.results || coursesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Section A - Hero Section */}
      <section className="relative text-white pt-32 pb-20 overflow-hidden" style={{ backgroundColor: '#0B033C' }}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Học tập không giới hạn
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Mọi lúc, mọi nơi
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto">
              Khám phá hàng nghìn khóa học từ các chuyên gia hàng đầu để nâng cao kỹ năng của bạn
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/courses"
                className="bg-white text-[#0B033C] px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:scale-105 transition-transform duration-200 hover:bg-gray-100"
              >
                Khám phá khóa học
              </Link>
              <Link
                to="/student/register"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:scale-105 transition-transform duration-200 border-2 border-white/40 hover:bg-white/30"
              >
                Đăng ký học
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section B - Popular Courses */}
      <PopularCourses courses={courses} />

      {/* Section C - Why Choose Us */}
      <WhyChooseUs />

      {/* Section D - Student Reviews */}
      <ReviewsCarousel />

      {/* Section E - Featured Instructors */}
      <TopInstructors />

      {/* Section F - Categories */}
      <Categories categories={categories} />

      {/* Section G - CTA Footer Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#EFFBFF' }}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0B033C]">
              Bắt đầu hành trình học tập của bạn hôm nay
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Tham gia cùng hàng nghìn học viên đang phát triển kỹ năng mỗi ngày
            </p>
            <Link
              to="/student/register"
              className="inline-block bg-[#0B033C] text-white px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform duration-200 hover:bg-[#0d0448]"
            >
              Đăng ký học ngay
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
