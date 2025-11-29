import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBook, FiLogOut, FiSave, FiUpload } from 'react-icons/fi';
import { authApi } from '../api/authApi';
import { showSuccess, showError } from '../utils/toast';
import useAuthStore from '../store/useAuthStore';
import { getImageUrl } from '../utils/imageUtils';
import SkeletonBlock from '../components/SkeletonBlock';

const Profile = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_no: '',
    bio: '',
    profile_img: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      const data = response.data;
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        mobile_no: data.mobile_no || '',
        bio: data.bio || '',
        profile_img: null,
      });
      if (data.profile_img) {
        setPreviewImage(getImageUrl(data.profile_img));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profile_img: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('mobile_no', formData.mobile_no || '');
      formDataToSend.append('bio', formData.bio || '');
      if (formData.profile_img) {
        formDataToSend.append('profile_img', formData.profile_img);
      }

      await authApi.updateProfile(formDataToSend);
      showSuccess('Cập nhật hồ sơ thành công!');
      
      // Update user in store
      const updatedProfile = await authApi.getProfile();
      const { setUser } = useAuthStore.getState();
      setUser(updatedProfile.data);
      
      // Refresh preview image
      if (updatedProfile.data.profile_img) {
        setPreviewImage(getImageUrl(updatedProfile.data.profile_img));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.response?.data?.error || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonBlock />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="account-sidebar">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                      <FiUser className="text-white text-4xl" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {user?.full_name || 'Người dùng'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || ''}
                </p>
              </div>

              <nav className="space-y-2">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiUser className="text-lg" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="/change-password"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/change-password'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiLock className="text-lg" />
                  <span>Đổi mật khẩu</span>
                </Link>
                <Link
                  to="/student/my-courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiBook className="text-lg" />
                  <span>Khóa học của tôi</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiLogOut className="text-lg" />
                  <span>Thoát tài khoản</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Hồ sơ cá nhân
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Avatar preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                          <FiUser className="text-white text-5xl" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                        <FiUpload className="mr-2" />
                        <span>Tải ảnh lên</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        JPG, PNG hoặc GIF. Tối đa 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email không thể thay đổi
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả cá nhân
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Giới thiệu về bản thân..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave />
                    <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .account-sidebar {
          width: 100%;
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.08);
        }
        .dark .account-sidebar {
          background: #1F2937;
        }
        .account-sidebar a,
        .account-sidebar button {
          display: block;
          width: 100%;
          text-align: left;
        }
        .account-sidebar a.active {
          color: #4f46e5;
        }
        @media (max-width: 1024px) {
          .account-sidebar {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;

