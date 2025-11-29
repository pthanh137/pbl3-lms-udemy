import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook } from 'react-icons/fi';

const Categories = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  const illustrationUrl = 'https://illustrations.popsy.co/amber/categories.svg';
  const fallbackIllustration = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=600&fit=crop&q=80';

  return (
    <section className="py-20" style={{ backgroundColor: '#EFFBFF' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0B033C' }}>
            Khám phá theo danh mục
          </h2>
          <p className="text-xl text-gray-700">
            Tìm khóa học phù hợp với sở thích của bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Illustration Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block lg:col-span-2"
          >
            <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
              <img
                src={illustrationUrl}
                alt="Categories illustration"
                className="w-full h-auto rounded-2xl"
                style={{ minHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = fallbackIllustration;
                  e.target.style.objectFit = 'cover';
                }}
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <div className="flex flex-wrap justify-center gap-4">
          {categories.slice(0, 8).map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -3 }}
            >
              <Link
                to={`/courses?category=${category.id}`}
                className="group flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-md hover:shadow-xl border-2 border-transparent transition-all duration-300"
                style={{
                  borderColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0B033C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #0B033C, #6B46C1)' }}>
                  <FiBook className="text-white" />
                </div>
                <span className="font-semibold transition-colors" style={{ color: '#0B033C' }}>
                  {category.title}
                </span>
              </Link>
            </motion.div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;

