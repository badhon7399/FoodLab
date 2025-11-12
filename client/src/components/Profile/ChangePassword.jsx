import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { HiLockClosed, HiEye, HiEyeOff, HiShieldCheck } from 'react-icons/hi';

const ChangePassword = ({ onSuccess, onError }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(', ');
    }

    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      onError(
        err.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '' };
    const errors = validatePassword(password);
    if (errors.length === 0) return { strength: 100, label: 'Strong', color: 'green' };
    if (errors.length <= 2) return { strength: 60, label: 'Medium', color: 'yellow' };
    return { strength: 30, label: 'Weak', color: 'red' };
  };

  const strength = passwordStrength(formData.newPassword);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Change Password
        </h2>
        <p className="text-gray-600">
          Keep your account secure by using a strong password
        </p>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-8">
        <div className="flex items-start gap-3">
          <HiShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Password Requirements:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Minimum 8 characters long</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one lowercase letter</li>
              <li>• At least one number</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Password *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiLockClosed className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => {
                setFormData({ ...formData, currentPassword: e.target.value });
                setErrors({ ...errors, currentPassword: '' });
              }}
              className={`w-full pl-12 pr-12 py-3 border-2 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:border-primary-500 focus:outline-none`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, current: !showPasswords.current })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiLockClosed className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => {
                setFormData({ ...formData, newPassword: e.target.value });
                setErrors({ ...errors, newPassword: '' });
              }}
              className={`w-full pl-12 pr-12 py-3 border-2 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:border-primary-500 focus:outline-none`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, new: !showPasswords.new })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-600">
                  Password Strength:
                </span>
                <span
                  className={`text-sm font-bold text-${strength.color}-600`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all bg-${strength.color}-500`}
                  style={{ width: `${strength.strength}%` }}
                />
              </div>
            </div>
          )}

          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiLockClosed className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setErrors({ ...errors, confirmPassword: '' });
              }}
              className={`w-full pl-12 pr-12 py-3 border-2 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:border-primary-500 focus:outline-none`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              <span>Changing Password...</span>
            </>
          ) : (
            <>
              <HiShieldCheck className="w-5 h-5" />
              <span>Change Password</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ChangePassword;