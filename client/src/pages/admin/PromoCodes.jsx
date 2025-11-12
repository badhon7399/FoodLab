import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiTicket,
  HiClock,
  HiCheckCircle,
  HiTag,
  HiUsers,
  HiChartBar,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
} from "react-icons/hi";
import axios from "axios";

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    usageCount: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };

  // Confirm modal
  const [confirmState, setConfirmState] = useState({ open: false, id: null, message: "" });
  const openConfirm = (id, message) => setConfirmState({ open: true, id, message });
  const closeConfirm = () => setConfirmState({ open: false, id: null, message: "" });

  // Sample data
  const samplePromoCodes = [
    {
      _id: "1",
      code: "CUET10",
      description: "Special discount for CUET students",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 200,
      maxDiscount: 100,
      usageLimit: 100,
      usageCount: 45,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      _id: "2",
      code: "FIRSTORDER",
      description: "First order discount",
      discountType: "fixed",
      discountValue: 50,
      minOrderAmount: 300,
      maxDiscount: 50,
      usageLimit: 200,
      usageCount: 123,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      _id: "3",
      code: "WEEKEND20",
      description: "Weekend special offer",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscount: 150,
      usageLimit: 50,
      usageCount: 50,
      validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: false,
    },
  ];

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/promo-codes`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPromoCodes(data);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      setPromoCodes(samplePromoCodes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/promo-codes/${
            editingPromo._id
          }`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        pushToast("Promo code updated", "success");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/promo-codes`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        pushToast("Promo code created", "success");
      }
      fetchPromoCodes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving promo code:", error);
      pushToast("Failed to save promo code", "error");
    }
  };

  const handleDelete = async (promoId) => {
    openConfirm(promoId, "Are you sure you want to delete this promo code? This action cannot be undone.");
  };

  const confirmDelete = async () => {
    const promoId = confirmState.id;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/promo-codes/${promoId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchPromoCodes();
      pushToast("Promo code deleted", "success");
    } catch (error) {
      console.error("Error deleting promo code:", error);
      pushToast("Failed to delete promo code", "error");
    } finally {
      closeConfirm();
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount,
      maxDiscount: promo.maxDiscount,
      usageLimit: promo.usageLimit,
      usageCount: promo.usageCount,
      validFrom: promo.validFrom.split("T")[0],
      validUntil: promo.validUntil.split("T")[0],
      isActive: promo.isActive,
    });
    setShowModal(true);
  };

  const togglePromoStatus = async (promoId, currentStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/promo-codes/${promoId}/toggle`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchPromoCodes();
      pushToast(`Promo ${!currentStatus ? "activated" : "deactivated"}`, "success");
    } catch (error) {
      console.error("Error toggling promo status:", error);
      pushToast("Failed to update promo status", "error");
    }
  };

  const resetForm = () => {
    setEditingPromo(null);
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      usageCount: 0,
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const daysRemaining = (validUntil) => {
    const days = Math.ceil(
      (new Date(validUntil) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-500 mt-1">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg"
        >
          <HiPlus className="w-5 h-5" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Active Codes</p>
              <h3 className="text-3xl font-bold mt-2">
                {samplePromoCodes.filter((p) => p.isActive).length}
              </h3>
            </div>
            <HiTicket className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Total Usage</p>
              <h3 className="text-3xl font-bold mt-2">
                {samplePromoCodes.reduce((sum, p) => sum + p.usageCount, 0)}
              </h3>
            </div>
            <HiUsers className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm">Total Savings</p>
              <h3 className="text-3xl font-bold mt-2">৳4,580</h3>
            </div>
            <HiTag className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm">Conversion Rate</p>
              <h3 className="text-3xl font-bold mt-2">34.2%</h3>
            </div>
            <HiChartBar className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {samplePromoCodes.map((promo) => (
          <motion.div
            key={promo._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border-2 ${
              isExpired(promo.validUntil)
                ? "border-red-200 opacity-60"
                : promo.isActive
                ? "border-green-200"
                : "border-gray-200"
            }`}
          >
            {/* Card Header */}
            <div
              className={`p-4 ${
                isExpired(promo.validUntil)
                  ? "bg-red-50"
                  : promo.isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600"
                  : "bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HiTicket
                    className={`w-6 h-6 ${
                      isExpired(promo.validUntil)
                        ? "text-red-500"
                        : promo.isActive
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  />
                  <h3
                    className={`text-xl font-bold tracking-wide ${
                      isExpired(promo.validUntil)
                        ? "text-red-700"
                        : promo.isActive
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {promo.code}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isExpired(promo.validUntil)
                      ? "bg-red-200 text-red-700"
                      : promo.isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {isExpired(promo.validUntil)
                    ? "Expired"
                    : promo.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">{promo.description}</p>

              {/* Discount Info */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-600">
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : `৳${promo.discountValue}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {promo.discountType === "percentage" ? "Discount" : "Off"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-semibold text-gray-900">
                    ৳{promo.minOrderAmount}
                  </span>
                </div>
                {promo.maxDiscount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Discount:</span>
                    <span className="font-semibold text-gray-900">
                      ৳{promo.maxDiscount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-semibold text-gray-900">
                    {promo.usageCount} / {promo.usageLimit}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Usage Progress</span>
                  <span>
                    {((promo.usageCount / promo.usageLimit) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                    style={{
                      width: `${(promo.usageCount / promo.usageLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Validity */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Valid From:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(promo.validFrom).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(promo.validUntil).toLocaleDateString()}
                  </span>
                </div>
                {!isExpired(promo.validUntil) && (
                  <div className="flex items-center space-x-2 text-xs text-orange-600">
                    <HiClock className="w-4 h-4" />
                    <span className="font-semibold">
                      {daysRemaining(promo.validUntil)} days remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEdit(promo)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <HiPencil className="w-4 h-4" />
                  <span className="text-sm font-semibold">Edit</span>
                </button>
                <button
                  onClick={() => togglePromoStatus(promo._id, promo.isActive)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                    promo.isActive
                      ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {promo.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(promo._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingPromo ? "Edit Promo Code" : "Create New Promo Code"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none uppercase"
                    placeholder="e.g., CUET10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="Special discount for CUET students"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder={
                        formData.discountType === "percentage" ? "10" : "50"
                      }
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Order Amount (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Discount (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscount: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usage Limit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="100"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum number of times this code can be used
                  </p>
                </div>

                {/* Valid From & Until */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Activate this promo code immediately
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {editingPromo ? "Update Promo Code" : "Create Promo Code"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeConfirm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-start gap-3">
                <HiExclamation className="w-6 h-6 text-amber-600 mt-0.5" />
                <div className="text-gray-800">
                  <h3 className="text-lg font-semibold mb-1">Confirm deletion</h3>
                  <p className="text-sm text-gray-600">{confirmState.message}</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-[min(360px,92vw)]">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
              className={`bg-white rounded-xl shadow-lg ring-1 overflow-hidden ${
                t.type === "success" ? "ring-green-200" : t.type === "error" ? "ring-red-200" : t.type === "warning" ? "ring-amber-200" : "ring-blue-200"
              }`}
            >
              <div className="relative">
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : t.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`}
                />
                <div className="p-3 pl-4 pr-10 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {t.type === "success" && <HiCheckCircle className="w-5 h-5 text-green-600" />}
                    {t.type === "error" && <HiXCircle className="w-5 h-5 text-red-600" />}
                    {t.type === "warning" && <HiExclamation className="w-5 h-5 text-amber-600" />}
                    {t.type === "info" && <HiInformationCircle className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="text-sm text-gray-800 leading-snug">{t.message}</div>
                  <button
                    className="absolute right-2 top-2 p-1 rounded-md hover:bg-gray-100 text-gray-500"
                    onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                    aria-label="Dismiss notification"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromoCodes;
