import { FaFacebook, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="py-12 mt-20 transition-colors duration-300" style={{ backgroundColor: '#EFFBFF' }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0B033C' }}>
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-[#0B033C]">LMS</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Học mọi thứ, mọi nơi, mọi lúc với nền tảng học tập hiện đại của chúng tôi.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: '#1877F2', color: 'white' }}
                aria-label="Facebook"
              >
                <FaFacebook className="text-lg" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: '#FF0000', color: 'white' }}
                aria-label="YouTube"
              >
                <FaYoutube className="text-lg" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color: 'white' }}
                aria-label="Instagram"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: '#0077B5', color: 'white' }}
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-[#0B033C] font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Khóa học
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#0B033C] font-semibold mb-4">Dành cho học viên</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/student/login"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Đăng nhập
                </a>
              </li>
              <li>
                <a
                  href="/student/register"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Đăng ký
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#0B033C] font-semibold mb-4">Dành cho giảng viên</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/teacher/login"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Đăng nhập
                </a>
              </li>
              <li>
                <a
                  href="/teacher/register"
                  className="text-gray-700 hover:text-[#0B033C] transition-colors"
                >
                  Đăng ký
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 LMS - Hệ thống quản lý học tập. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
