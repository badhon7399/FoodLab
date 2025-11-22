import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShoppingBag,
  HiClock,
  HiCheckCircle,
  HiX,
  HiTruck,
  HiEye,
  HiStar,
  HiLocationMarker,
  HiPhone,
  HiCreditCard,
  HiInformationCircle,
  HiExclamation,
  HiUser,
} from "react-icons/hi";
import axios from "axios";
import { Link } from "react-router-dom";
import { initializeSocket } from "../utils/socket";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0)
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };

  // Confirm modal
  const [confirmState, setConfirmState] = useState({
    open: false,
    id: null,
    message: "",
  });
  const openConfirm = (id, message) =>
    setConfirmState({ open: true, id, message });
  const closeConfirm = () =>
    setConfirmState({ open: false, id: null, message: "" });

  const statusColors = {
    Pending: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-200",
      icon: HiClock,
      gradient: "from-yellow-400 to-orange-500",
    },
    Preparing: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-200",
      icon: HiClock,
      gradient: "from-blue-400 to-indigo-500",
    },
    "Out for Delivery": {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-200",
      icon: HiTruck,
      gradient: "from-purple-400 to-pink-500",
    },
    Delivered: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-200",
      icon: HiCheckCircle,
      gradient: "from-green-400 to-emerald-500",
    },
    Cancelled: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-200",
      icon: HiX,
      gradient: "from-red-400 to-rose-500",
    },
  };

  // Robust status config getter
  const getStatusConfig = (status) => {
    if (!status) return statusColors.Pending;
    const normalizedStatus = status.toLowerCase();
    const configMap = {
      pending: statusColors.Pending,
      preparing: statusColors.Preparing,
      "out for delivery": statusColors["Out for Delivery"],
      delivered: statusColors.Delivered,
      cancelled: statusColors.Cancelled,
    };
    return configMap[normalizedStatus] || statusColors.Pending;
  };

  useEffect(() => {
    fetchOrders();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    const token = localStorage.getItem("token");
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

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Update! 📦", {
          body: `Your order is now ${data.status}`,
          icon: "/logo.png",
        });
      }
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Robust data handling
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      pushToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    openConfirm(orderId, "Are you sure you want to cancel this order?");
  };

  const confirmCancel = async () => {
    const orderId = confirmState.id;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchOrders();
      pushToast("Order cancelled successfully", "success");
    } catch (error) {
      pushToast("Failed to cancel order", "error");
    } finally {
      closeConfirm();
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
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      pushToast("Review submitted successfully", "success");
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      // Optimistically update the order to show reviewed state if needed
      // For now, just close modal
    } catch (error) {
      pushToast("Failed to submit review", "error");
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="mt-4 text-gray-500 font-medium text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            My Orders
          </h1>
          <p className="text-lg text-gray-600">
            Track your delicious meals in real-time
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-3 min-w-max">
            {[
              "All",
              "Pending",
              "Preparing",
              "Out for Delivery",
              "Delivered",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 text-sm ${filterStatus === status
                    ? "bg-gray-900 text-white shadow-lg transform scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                {status}
                {status !== "All" && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filterStatus === status
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {orders.filter((o) => o.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <HiShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-8 text-center max-w-md">
              Looks like you haven't placed any orders yet. Explore our menu and
              treat yourself to something delicious!
            </p>
            <Link
              to="/menu"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
            >
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8"
          >
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order._id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-shadow duration-300"
                >
                  <div className="p-6 md:p-8">
                    {/* Card Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${statusConfig.gradient} text-white shadow-lg`}
                        >
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 mb-8 border border-gray-100">
                      <div className="flex flex-wrap gap-4 items-center">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative group"
                            title={`${item.quantity}x ${item.name}`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-200 group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-300">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {order.status !== "Cancelled" &&
                      order.status !== "Delivered" && (
                        <div className="mb-8">
                          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                            <span>Pending</span>
                            <span>Preparing</span>
                            <span>On Way</span>
                            <span>Delivered</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  order.status === "Pending"
                                    ? "15%"
                                    : order.status === "Preparing"
                                      ? "50%"
                                      : order.status === "Out for Delivery"
                                        ? "80%"
                                        : "100%",
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${statusConfig.gradient}`}
                            />
                          </div>
                        </div>
                      )}

                    {/* Actions Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <HiCreditCard className="w-5 h-5 text-gray-400" />
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          ৳{order.totalAmount}
                        </div>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          <HiEye className="w-5 h-5" />
                          Details
                        </button>

                        {order.status === "Pending" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {order.status === "Delivered" && !order.rating && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReviewModal(true);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-100 transition-colors"
                          >
                            <HiStar className="w-5 h-5" />
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowOrderModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
              >
                <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      #{selectedOrder._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <HiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Status Section */}
                  <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
                    <span className="font-semibold text-gray-600">
                      Current Status
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusConfig(selectedOrder.status).bg
                        } ${getStatusConfig(selectedOrder.status).text}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              ৳{item.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="font-bold text-gray-900">
                            ৳{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Delivery</h3>
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <HiUser className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Receiver
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <HiPhone className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Phone
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails?.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <HiLocationMarker className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">
                            Address
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails?.hall || "N/A"}
                            {selectedOrder.deliveryDetails?.roomNumber &&
                              `, Room ${selectedOrder.deliveryDetails.roomNumber}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>
                          ৳{selectedOrder.subtotal || selectedOrder.totalAmount}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee</span>
                        <span>৳{selectedOrder.deliveryFee || 0}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-extrabold text-primary-600">
                          ৳{selectedOrder.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-white text-center">
                  <h2 className="text-3xl font-bold mb-2">Rate Order</h2>
                  <p className="opacity-90">How was your food?</p>
                </div>

                <div className="p-8">
                  <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setReviewData({ ...reviewData, rating: star })
                        }
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <HiStar
                          className={`w-10 h-10 ${star <= reviewData.rating
                              ? "text-yellow-400"
                              : "text-gray-200"
                            }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, comment: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-yellow-400 resize-none mb-6"
                    placeholder="Share your experience..."
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
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
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiExclamation className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Cancel Order?
                </h3>
                <p className="text-gray-500 mb-6">{confirmState.message}</p>
                <div className="flex gap-3">
                  <button
                    onClick={closeConfirm}
                    className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    No, Keep it
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${t.type === "success"
                    ? "bg-white border-green-100 text-green-800"
                    : t.type === "error"
                      ? "bg-white border-red-100 text-red-800"
                      : "bg-white border-blue-100 text-blue-800"
                  }`}
              >
                {t.type === "success" && (
                  <HiCheckCircle className="w-6 h-6 text-green-500" />
                )}
                {t.type === "error" && (
                  <HiXCircle className="w-6 h-6 text-red-500" />
                )}
                {t.type === "info" && (
                  <HiInformationCircle className="w-6 h-6 text-blue-500" />
                )}
                <p className="font-medium text-sm">{t.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Orders;
