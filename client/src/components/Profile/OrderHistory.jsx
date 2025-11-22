import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  HiShoppingBag,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiTruck,
  HiEye,
  HiDownload,
  HiFilter,
  HiStar,
  HiExclamation,
  HiX,
} from 'react-icons/hi';
import { initializeSocket } from '../../utils/socket';

const OrderHistory = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // New state for features
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [confirmState, setConfirmState] = useState({ open: false, id: null, message: '' });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchOrders();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    if (!token) return;
    const socket = initializeSocket(token);
    if (!socket) return;

    socket.on("order-status-updated", (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );
      pushToast(`Order status updated: ${data.status}`, "info");
    });
  };

  const pushToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Handle both array and object response formats
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      pushToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    setConfirmState({ open: true, id: orderId, message: "Are you sure you want to cancel this order?" });
  };

  const confirmCancel = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${confirmState.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      pushToast("Order cancelled successfully", "success");
    } catch (error) {
      pushToast("Failed to cancel order", "error");
    } finally {
      setConfirmState({ open: false, id: null, message: '' });
    }
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews`,
        {
          order: selectedOrder._id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      pushToast("Review submitted successfully", "success");
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      // Optionally refresh orders to update review status if needed
    } catch (error) {
      pushToast("Failed to submit review", "error");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Pending: { icon: HiClock, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      pending: { icon: HiClock, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      Preparing: { icon: HiClock, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', label: 'Preparing' },
      processing: { icon: HiTruck, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      "Out for Delivery": { icon: HiTruck, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', label: 'Out for Delivery' },
      Completed: { icon: HiCheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      completed: { icon: HiCheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      Delivered: { icon: HiCheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
      Cancelled: { icon: HiXCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      cancelled: { icon: HiXCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    return configs[status] || configs.Pending;
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase());

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <p className="text-gray-600 mt-1">
            You have {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <HiFilter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <HiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet"
              : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={() => setSelectedOrder(order)}
              getStatusConfig={getStatusConfig}
              onCancel={() => handleCancelOrder(order._id)}
              onReview={() => {
                setSelectedOrder(order);
                setShowReviewModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && !showReviewModal && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            getStatusConfig={getStatusConfig}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedOrder && (
          <ReviewModal
            onClose={() => setShowReviewModal(false)}
            onSubmit={handleSubmitReview}
            reviewData={reviewData}
            setReviewData={setReviewData}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState.open && (
          <ConfirmModal
            message={confirmState.message}
            onConfirm={confirmCancel}
            onCancel={() => setConfirmState({ open: false, id: null, message: '' })}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-[min(360px,92vw)] pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className={`bg-white rounded-xl shadow-lg ring-1 p-4 pointer-events-auto ${t.type === "success" ? "ring-green-200" : t.type === "error" ? "ring-red-200" : "ring-blue-200"
                }`}
            >
              <div className="flex items-center gap-3">
                {t.type === "success" ? <HiCheckCircle className="text-green-500 w-5 h-5" /> :
                  t.type === "error" ? <HiXCircle className="text-red-500 w-5 h-5" /> :
                    <HiExclamation className="text-blue-500 w-5 h-5" />}
                <p className="text-gray-700 font-medium text-sm">{t.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const OrderCard = ({ order, onViewDetails, getStatusConfig, onCancel, onReview }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-500">
              Order #{order.orderNumber || order._id.slice(-6)}
            </span>
            <span
              className={`flex items-center gap-1 px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-sm font-semibold`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Items</p>
              <p className="font-semibold text-gray-900">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-semibold text-gray-900">
                ৳{order.total.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Delivery</p>
              <p className="font-semibold text-gray-900">{order.deliverySlot}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-semibold"
          >
            <HiEye className="w-5 h-5" />
            <span>Details</span>
          </button>

          {order.status === "Pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
            >
              Cancel
            </button>
          )}

          {order.status === "Delivered" && !order.rating && (
            <button
              onClick={(e) => { e.stopPropagation(); onReview(); }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-semibold"
            >
              <HiStar className="w-5 h-5" />
              <span>Review</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const OrderDetailsModal = ({ order, onClose, getStatusConfig }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const downloadInvoice = () => {
    console.log('Downloading invoice for order:', order._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-500 mt-1">
              Order #{order.orderNumber || order._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiXCircle className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center gap-2 px-4 py-2 ${statusConfig.bg} ${statusConfig.text} rounded-full font-semibold`}
            >
              <StatusIcon className="w-5 h-5" />
              {statusConfig.label}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Delivery Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Hall</p>
                <p className="font-semibold text-gray-900">{order.hall}</p>
              </div>
              <div>
                <p className="text-gray-500">Room</p>
                <p className="font-semibold text-gray-900">{order.room}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Slot</p>
                <p className="font-semibold text-gray-900">
                  {order.deliverySlot}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{order.phone}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3">
                <p className="text-gray-500 text-sm">Notes</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 rounded-xl p-4"
                >
                  <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{item.name}</h5>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  ৳{(order.total - (order.deliveryFee || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  ৳{(order.deliveryFee || 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-primary-600">
                  ৳{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={downloadInvoice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <HiDownload className="w-5 h-5" />
              Download Invoice
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ReviewModal = ({ onClose, onSubmit, reviewData, setReviewData }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
    >
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white rounded-t-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Rate Your Order</h2>
            <p className="text-white/80 mt-1">How was your experience?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <HiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Rating</label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setReviewData({ ...reviewData, rating: star })}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <HiStar className={`w-10 h-10 ${star <= reviewData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review (Optional)</label>
          <textarea
            rows={4}
            value={reviewData.comment}
            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
            placeholder="Tell us about your experience..."
          />
        </div>

        <button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Submit Review
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onCancel}
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
          <h3 className="text-lg font-semibold mb-1">Confirm action</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
      <div className="px-6 pb-6 flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
          Keep Order
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          Cancel Order
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default OrderHistory;