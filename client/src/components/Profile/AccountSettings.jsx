import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  HiBell,
  HiMail,
  HiShieldCheck,
  HiCog,
  HiTrash,
  HiExclamation,
} from 'react-icons/hi';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: false,
    twoFactorAuth: false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/settings`,
        newSettings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Error updating settings:', err);
      setSettings(settings); // Revert on error
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(logout());
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Account Settings
        </h2>
        <p className="text-gray-600">Manage your preferences and privacy</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <HiBell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
            <p className="text-sm text-gray-500">
              Choose what notifications you want to receive
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Email Notifications"
            description="Receive notifications via email"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <SettingToggle
            label="Order Updates"
            description="Get notified about your order status"
            checked={settings.orderUpdates}
            onChange={() => handleToggle('orderUpdates')}
          />
          <SettingToggle
            label="Promotions"
            description="Receive special offers and discounts"
            checked={settings.promotions}
            onChange={() => handleToggle('promotions')}
          />
          <SettingToggle
            label="Newsletter"
            description="Stay updated with our latest news"
            checked={settings.newsletter}
            onChange={() => handleToggle('newsletter')}
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <HiShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Security</h3>
            <p className="text-sm text-gray-500">
              Keep your account safe and secure
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            checked={settings.twoFactorAuth}
            onChange={() => handleToggle('twoFactorAuth')}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <HiExclamation className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-lg">Danger Zone</h3>
            <p className="text-sm text-red-700">
              Irreversible actions for your account
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          <HiTrash className="w-5 h-5" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </motion.div>
  );
};

const SettingToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const DeleteAccountModal = ({ onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setLoading(true);
    await onConfirm();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiExclamation className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Delete Account
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Type <span className="text-red-600">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
            placeholder="DELETE"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountSettings;