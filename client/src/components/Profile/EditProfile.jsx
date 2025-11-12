import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiSave, HiX } from 'react-icons/hi';

const EditProfile = ({ onSuccess, onError, onCancel }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    hall: user?.hall || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
  });

  const halls = [
    'Amar Ekushey Hall',
    'Shaheed Abdur Rab Hall',
    'Shah Jalal Hall',
    'Shamsun Nahar Hall',
    'Dr. M. A. Rashid Hall',
    'Others',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local storage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      onSuccess('Profile updated successfully!');
      
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Hall */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hall *
            </label>
            <select
              name="hall"
              value={formData.hall}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            >
              <option value="">Select Hall</option>
              {halls.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfile;