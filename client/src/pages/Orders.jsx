import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShoppingBag,
  HiClock,
  HiCheckCircle,
  HiX,
  HiTruck,
  HiEye,
  HiRefresh,
  HiChevronRight,
  HiStar,
  HiLocationMarker,
  HiPhone,
  HiCreditCard,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
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
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };

  // Confirm modal
  const [confirmState, setConfirmState] = useState({ open: false, id: null, message: "" });
  const openConfirm = (id, message) => setConfirmState({ open: true, id, message });
  const closeConfirm = () => setConfirmState({ open: false, id: null, message: "" });

  const statusColors = {
    Pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: HiClock,
    },
    Preparing: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: HiClock,
    },
    "Out for Delivery": {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: HiTruck,
    },
    Delivered: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      icon: HiCheckCircle,
    },
    Cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      icon: HiX,
    },
  };

  useEffect(() => {
    fetchOrders();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = initializeSocket(token);
    if (!socket) return; // sockets disabled or failed to init

    socket.on("order-status-updated", (data) => {
      console.log("Order status updated:", data);
      // Update order in list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );

      // Show notification
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

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
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
      pushToast("Order cancelled", "success");
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
    } catch (error) {
      pushToast("Failed to submit review", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your food orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-2 inline-flex space-x-2">
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
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-2 text-xs">
                  ({orders.filter((o) => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-16 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <HiShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet
            </p>
            <Link
              to="/menu"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Start Ordering
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((order, index) => {
              const statusConfig = statusColors[order.status];
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order._id.slice(-8)}
                          </h3>
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span>{order.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <HiEye className="w-5 h-5" />
                          <span className="font-semibold">View Details</span>
                        </button>

                        {order.status === "Pending" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
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
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                          >
                            <HiStar className="w-5 h-5" />
                            <span className="font-semibold">Review</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {order.items.slice(0, 2).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">
                            ৳{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-6 mb-4 md:mb-0">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <HiCreditCard className="w-5 h-5" />
                          <span className="text-sm">{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <HiLocationMarker className="w-5 h-5" />
                          <span className="text-sm">
                            {order.deliveryDetails.hall}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-primary-500">
                          ৳{order.totalAmount}
                        </p>
                      </div>
                    </div>

                    {/* Order Progress */}
                    {order.status !== "Cancelled" &&
                      order.status !== "Delivered" && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="relative">
                            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                              <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{
                                  width:
                                    order.status === "Pending"
                                      ? "25%"
                                      : order.status === "Preparing"
                                      ? "50%"
                                      : order.status === "Out for Delivery"
                                      ? "75%"
                                      : "100%",
                                }}
                              />
                            </div>
                            <div className="relative flex justify-between">
                              {[
                                "Pending",
                                "Preparing",
                                "Out for Delivery",
                                "Delivered",
                              ].map((status, idx) => (
                                <div
                                  key={status}
                                  className="flex flex-col items-center"
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                      [
                                        "Pending",
                                        "Preparing",
                                        "Out for Delivery",
                                        "Delivered",
                                      ].indexOf(order.status) >= idx
                                        ? "bg-primary-500 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <span className="text-xs mt-2 text-gray-600">
                                    {status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowOrderModal(false)}
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">Order Details</h2>
                      <p className="text-white/80 mt-1">
                        #{selectedOrder._id.slice(-8)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Order Status */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          statusColors[selectedOrder.status].bg
                        } ${statusColors[selectedOrder.status].text}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              ৳{item.price} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">
                            ৳{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">
                      Delivery Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start space-x-3">
                        <HiUser className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <HiPhone className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <HiLocationMarker className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold text-gray-900">
                            {selectedOrder.deliveryDetails.hall}
                            {selectedOrder.deliveryDetails.roomNumber &&
                              `, Room ${selectedOrder.deliveryDetails.roomNumber}`}
                          </p>
                        </div>
                      </div>
                      {selectedOrder.deliveryDetails.instructions && (
                        <div className="flex items-start space-x-3">
                          <HiInformationCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Instructions
                            </p>
                            <p className="font-semibold text-gray-900">
                              {selectedOrder.deliveryDetails.instructions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">
                      Payment Summary
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-৳{selectedOrder.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t">
                        <span>Total</span>
                        <span className="text-primary-500">
                          ৳{selectedOrder.totalAmount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold text-gray-900">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Status</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedOrder.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {selectedOrder.paymentStatus}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">Rate Your Order</h2>
                      <p className="text-white/80 mt-1">
                        How was your experience?
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                      Rating
                    </label>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setReviewData({ ...reviewData, rating: star })
                          }
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <HiStar
                            className={`w-10 h-10 ${
                              star <= reviewData.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {reviewData.rating === 5
                        ? "Excellent! 🎉"
                        : reviewData.rating === 4
                        ? "Good! 👍"
                        : reviewData.rating === 3
                        ? "Average"
                        : reviewData.rating === 2
                        ? "Poor"
                        : "Very Poor"}
                    </p>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitReview}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Submit Review
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                  <h3 className="text-lg font-semibold mb-1">Confirm action</h3>
                  <p className="text-sm text-gray-600">{confirmState.message}</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Cancel Order
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

export default Orders;
