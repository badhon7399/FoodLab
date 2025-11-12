import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiShoppingBag,
  HiLocationMarker,
  HiLockClosed,
  HiCog,
  HiLogout,
  HiCamera,
  HiCheckCircle,
  HiExclamation,
} from 'react-icons/hi';
import api from '../utils/api';
import { logout } from '../redux/slices/authSlice';

// Import Profile Components
import ProfileOverview from '../components/Profile/ProfileOverview';
import EditProfile from '../components/Profile/EditProfile';
import OrderHistory from '../components/Profile/OrderHistory';
import AddressBook from '../components/Profile/AddressBook';
import ChangePassword from '../components/Profile/ChangePassword';
import AccountSettings from '../components/Profile/AccountSettings';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: [],
    recentOrders: [],
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: HiUser },
    { id: 'orders', name: 'My Orders', icon: HiShoppingBag },
    { id: 'addresses', name: 'Addresses', icon: HiLocationMarker },
    { id: 'security', name: 'Security', icon: HiLockClosed },
    { id: 'settings', name: 'Settings', icon: HiCog },
  ];

  useEffect(() => {
    // Check authentication before fetching stats
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchUserStats();
  }, [isAuthenticated, user, navigate]);

  const fetchUserStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      // Backend returns: { totalOrders, totalSpent, favoriteItems }
      setUserStats({
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
        favoriteItems: data.favoriteItems || [],
        recentOrders: [], // This will be fetched separately if needed
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        dispatch(logout());
        navigate('/login');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Profile picture updated successfully!');
      
      // Update local storage
      const updatedUser = { ...user, avatar: data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        setSuccess('');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl"
            >
              <div className="flex items-center space-x-3">
                <HiCheckCircle className="w-6 h-6 text-green-500" />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
            >
              <div className="flex items-center space-x-3">
                <HiExclamation className="w-6 h-6 text-red-500" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500" />
                    ) : (
                      <HiCamera className="w-5 h-5 text-gray-700" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="mt-3">
                  <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <HiLogout className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {activeTab === 'overview' && (
                <ProfileOverview userStats={userStats} />
              )}
              
              {activeTab === 'edit' && (
                <EditProfile 
                  onSuccess={showSuccess} 
                  onError={showError} 
                />
              )}
              
              {activeTab === 'orders' && (
                <OrderHistory />
              )}
              
              {activeTab === 'addresses' && (
                <AddressBook />
              )}
              
              {activeTab === 'security' && (
                <ChangePassword 
                  onSuccess={showSuccess} 
                  onError={showError} 
                />
              )}
              
              {activeTab === 'settings' && (
                <AccountSettings />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;