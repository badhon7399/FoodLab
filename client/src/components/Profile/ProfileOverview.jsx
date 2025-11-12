import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  HiShoppingBag,
  HiTrendingUp,
  HiHeart,
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiAcademicCap,
  HiCalendar,
  HiPencil,
} from 'react-icons/hi';
import { useState } from 'react';
import EditProfile from './EditProfile';

const ProfileOverview = ({ userStats }) => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSuccess = (message) => {
    setSuccess(message);
    setIsEditing(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  if (isEditing) {
    return (
      <EditProfile
        onSuccess={handleSuccess}
        onError={handleError}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiShoppingBag className="w-10 h-10 text-blue-600" />
              <span className="text-sm text-blue-600 font-semibold">Total</span>
            </div>
            <h3 className="text-4xl font-bold text-blue-900 mb-1">
              {userStats.totalOrders || 0}
            </h3>
            <p className="text-blue-700 text-sm">Orders Placed</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiTrendingUp className="w-10 h-10 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">Spent</span>
            </div>
            <h3 className="text-4xl font-bold text-green-900 mb-1">
              ৳{userStats.totalSpent?.toLocaleString() || 0}
            </h3>
            <p className="text-green-700 text-sm">Total Amount</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiHeart className="w-10 h-10 text-purple-600" />
              <span className="text-sm text-purple-600 font-semibold">Favorites</span>
            </div>
            <h3 className="text-4xl font-bold text-purple-900 mb-1">
              {userStats.favoriteItems?.length || 0}
            </h3>
            <p className="text-purple-700 text-sm">Saved Items</p>
          </motion.div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <HiPencil className="w-5 h-5" />
            <span className="font-semibold">Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={HiUser} label="Full Name" value={user?.name} />
          <InfoItem icon={HiMail} label="Email" value={user?.email} />
          <InfoItem icon={HiPhone} label="Phone" value={user?.phone} />
          <InfoItem icon={HiLocationMarker} label="Hall" value={user?.hall} />
          <InfoItem
            icon={HiAcademicCap}
            label="Department"
            value={user?.department || 'Not specified'}
          />
          <InfoItem
            icon={HiCalendar}
            label="Member Since"
            value={new Date(user?.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          />
        </div>
      </div>

      {/* Favorite Items */}
      {userStats.favoriteItems && userStats.favoriteItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Favorite Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userStats.favoriteItems.map((item) => (
              <motion.div
                key={item._id}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg mx-auto mb-3"
                />
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.count} orders</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gray-50 rounded-xl p-5 border border-gray-100"
  >
    <div className="flex items-center space-x-3 mb-2">
      <div className="bg-white p-2 rounded-lg">
        <Icon className="w-5 h-5 text-primary-500" />
      </div>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
    <p className="text-gray-900 font-semibold ml-11">{value}</p>
  </motion.div>
);

export default ProfileOverview;