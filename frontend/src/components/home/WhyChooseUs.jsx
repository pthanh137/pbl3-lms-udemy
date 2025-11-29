import { motion } from 'framer-motion';
import {
  FiClock,
  FiUser,
  FiCode,
  FiRefreshCw,
  FiAward,
  FiHeadphones,
} from 'react-icons/fi';

const benefits = [
  {
    icon: FiAward,
    title: 'Chất lượng cao',
    description: 'Nội dung của khóa học được đầu tư cả về chất và lượng, giáo viên có kinh nghiệm và cực kỳ tâm huyết với công việc giảng dạy.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: FiCode,
    title: 'Cung cấp nhiều kỹ năng quan trọng',
    description: 'Khóa học cung cấp kỹ thuật lập trình, tư duy logic, cách giải quyết bài toán, thuật toán... Những kỹ năng sẽ theo bạn mãi trong học tập và công việc sau này.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FiUser,
    title: 'Bước chuẩn bị vững chắc của một lập trình viên',
    description: 'Kỹ thuật lập trình là kỹ năng đầu tiên cần phải học khi bạn muốn trở thành một lập trình viên, việc học tốt kỹ thuật lập trình sẽ là bước đệm vững chắc cho sự nghiệp của bạn',
    gradient: 'from-purple-500 to-pink-500',
  },
];

// Illustration URLs - using free illustration services
// Primary: Popsy illustrations (modern SVG illustrations)
const illustrationUrl = 'https://illustrations.popsy.co/amber/online-learning.svg';
// Fallback: Unsplash photo
const fallbackIllustration = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop&q=80';

const WhyChooseUs = () => {
  return (
    <section className="py-20" style={{ backgroundColor: '#EFFBFF' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0B033C' }}>
            Tại sao bạn nên học với chúng tôi?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Illustration */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl overflow-hidden">
                <img
                  src={illustrationUrl}
                  alt="Student learning illustration"
                  className="w-full h-auto rounded-2xl"
                  style={{ minHeight: '400px', objectFit: 'contain' }}
                  onError={(e) => {
                    // Fallback to Unsplash image if illustration fails to load
                    e.target.src = fallbackIllustration;
                    e.target.style.objectFit = 'cover';
                  }}
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Right Side - Benefits Cards */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white text-xl" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#0B033C' }}>
                        {benefit.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

