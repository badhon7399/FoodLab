import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  HiPlus,
  HiLocationMarker,
  HiPencil,
  HiTrash,
  HiCheckCircle,
} from 'react-icons/hi';

const AddressBook = () => {
  const { token } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/addresses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/addresses/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(addresses.filter((addr) => addr._id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/addresses/${id}/default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-gray-600 mt-1">
            Manage your delivery addresses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <HiPlus className="w-5 h-5" />
          Add Address
        </button>
      </div>

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <AddressForm
            address={editingAddress}
            onClose={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingAddress(null);
              fetchAddresses();
            }}
          />
        )}
      </AnimatePresence>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <HiLocationMarker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No saved addresses
          </h3>
          <p className="text-gray-500 mb-6">
            Add your first delivery address to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={() => {
                setEditingAddress(address);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(address._id)}
              onSetDefault={() => handleSetDefault(address._id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white border-2 ${
        address.isDefault ? 'border-primary-500' : 'border-gray-200'
      } rounded-xl p-6 hover:shadow-lg transition-all`}
    >
      {address.isDefault && (
        <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
          <HiCheckCircle className="w-4 h-4" />
          Default
        </span>
      )}

      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2">
          {address.label || 'Address'}
        </h3>
        <div className="space-y-1 text-gray-600">
          <p className="font-semibold">{address.hall}</p>
          <p>Room: {address.room}</p>
          {address.floor && <p>Floor: {address.floor}</p>}
          {address.building && <p>Building: {address.building}</p>}
          {address.notes && (
            <p className="text-sm text-gray-500 mt-2">{address.notes}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!address.isDefault && (
          <button
            onClick={onSetDefault}
            className="flex-1 px-3 py-2 border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-semibold"
          >
            Set Default
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HiPencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const AddressForm = ({ address, onClose, onSave }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: address?.label || '',
    hall: address?.hall || '',
    room: address?.room || '',
    floor: address?.floor || '',
    building: address?.building || '',
    notes: address?.notes || '',
    isDefault: address?.isDefault || false,
  });

  const halls = [
    'Amar Ekushey Hall',
    'Shaheed Abdur Rab Hall',
    'Shah Jalal Hall',
    'Shamsun Nahar Hall',
    'Dr. M. A. Rashid Hall',
    'Others',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (address) {
        // Update existing address
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/addresses/${address._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new address
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/addresses`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      onSave();
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 rounded-xl p-6 border-2 border-primary-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {address ? 'Edit Address' : 'Add New Address'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label (e.g., Home, Dorm)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              placeholder="Home"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hall *
            </label>
            <select
              value={formData.hall}
              onChange={(e) =>
                setFormData({ ...formData, hall: e.target.value })
              }
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              placeholder="301"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Floor
            </label>
            <input
              type="text"
              value={formData.floor}
              onChange={(e) =>
                setFormData({ ...formData, floor: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              placeholder="3rd Floor"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Building/Block
            </label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) =>
                setFormData({ ...formData, building: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              placeholder="Block A"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
              placeholder="Delivery instructions..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) =>
              setFormData({ ...formData, isDefault: e.target.checked })
            }
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isDefault" className="text-gray-700 font-medium">
            Set as default address
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddressBook;