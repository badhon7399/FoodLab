import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiFilter,
  HiStar,
  HiEye,
  HiTrash,
  HiCheckCircle,
  HiX,
  HiReply,
  HiDotsVertical,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
} from "react-icons/hi";
import axios from "axios";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [replyText, setReplyText] = useState("");

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

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, ratingFilter, statusFilter, reviews]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/reviews`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (ratingFilter !== "All") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    if (statusFilter !== "All") {
      const isApproved = statusFilter === "Approved";
      filtered = filtered.filter((review) => review.isApproved === isApproved);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.food?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const toggleReviewStatus = async (reviewId, currentStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/reviews/${reviewId}/approve`,
        { isApproved: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchReviews();
      pushToast(`Review ${!currentStatus ? "approved" : "unapproved"}`, "success");
    } catch (error) {
      console.error("Error updating review status:", error);
      pushToast("Failed to update review status", "error");
    }
  };

  const deleteReview = async (reviewId) => {
    openConfirm(reviewId, "Are you sure you want to delete this review? This action cannot be undone.");
  };

  const confirmDelete = async () => {
    const reviewId = confirmState.id;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchReviews();
      pushToast("Review deleted", "success");
    } catch (error) {
      console.error("Error deleting review:", error);
      pushToast("Failed to delete review", "error");
    } finally {
      closeConfirm();
    }
  };

  const replyToReview = async (reviewId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/reviews/${reviewId}/reply`,
        { reply: replyText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReplyText("");
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      console.error("Error replying to review:", error);
    }
  };

  const StarRating = ({ rating, size = "sm" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <HiStar
            key={index}
            className={`${sizeClasses[size]} ${
              index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Sample data for demonstration
  const sampleReviews = [
    {
      _id: "1",
      user: { name: "John Doe", avatar: "JD" },
      food: { name: "Chicken Pizza", image: "/pizza.jpg" },
      rating: 5,
      comment:
        "Absolutely delicious! Best pizza on campus. The chicken was perfectly cooked and the cheese was amazing.",
      isApproved: true,
      createdAt: new Date().toISOString(),
      reply: null,
    },
    {
      _id: "2",
      user: { name: "Jane Smith", avatar: "JS" },
      food: { name: "Beef Burger", image: "/burger.jpg" },
      rating: 4,
      comment:
        "Great burger! Would have given 5 stars but the delivery was a bit slow.",
      isApproved: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      reply:
        "Thank you for your feedback! We are working on improving our delivery times.",
    },
    {
      _id: "3",
      user: { name: "Mike Johnson", avatar: "MJ" },
      food: { name: "Chicken Shawarma", image: "/shawarma.jpg" },
      rating: 3,
      comment: "It was okay. Expected better quality for the price.",
      isApproved: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      reply: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reviews Management
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor and respond to customer reviews
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-yellow-100 text-sm">Average Rating</p>
              <h3 className="text-3xl font-bold mt-2">4.6</h3>
            </div>
            <HiStar className="w-12 h-12 text-white/30" />
          </div>
          <StarRating rating={5} size="md" />
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Reviews</p>
              <h3 className="text-3xl font-bold mt-2">842</h3>
            </div>
            <HiCheckCircle className="w-12 h-12 text-white/30" />
          </div>
          <p className="text-sm text-green-100 mt-2">+23 this week</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Approved</p>
              <h3 className="text-3xl font-bold mt-2">789</h3>
            </div>
            <HiCheckCircle className="w-12 h-12 text-white/30" />
          </div>
          <p className="text-sm text-blue-100 mt-2">93.7% approval rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending</p>
              <h3 className="text-3xl font-bold mt-2">53</h3>
            </div>
            <HiFilter className="w-12 h-12 text-white/30" />
          </div>
          <p className="text-sm text-purple-100 mt-2">Needs moderation</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Rating Distribution
        </h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = Math.floor(Math.random() * 200) + 50;
            const percentage = (count / 842) * 100;
            return (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-24">
                  <span className="text-sm font-semibold text-gray-700">
                    {rating}
                  </span>
                  <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: (5 - rating) * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-16">
                  {count}
                </span>
                <span className="text-sm text-gray-500 w-16">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sampleReviews.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.user.avatar}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        {review.user.name}
                      </h3>
                      <StarRating rating={review.rating} />
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          review.isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <span>Reviewed</span>
                      <span className="font-semibold text-primary-500">
                        {review.food.name}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Admin Reply */}
                    {review.reply && (
                      <div className="mt-4 pl-4 border-l-4 border-primary-500 bg-primary-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <HiReply className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">
                            Admin Response
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0 ml-4">
                  <img
                    src={review.food.image}
                    alt={review.food.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setShowReviewModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors font-semibold"
                >
                  <HiReply className="w-4 h-4" />
                  <span>{review.reply ? "Edit Reply" : "Reply"}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      toggleReviewStatus(review._id, review.isApproved)
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      review.isApproved
                        ? "text-yellow-600 hover:bg-yellow-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {review.isApproved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReviewModal && selectedReview && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Reply to Review</h2>
                    <p className="text-white/80 mt-1">
                      Respond to {selectedReview.user.name}'s review
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
                {/* Original Review */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <StarRating rating={selectedReview.rating} />
                    <span className="text-sm text-gray-600">
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>

                {/* Reply Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Thank you for your feedback..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => replyToReview(selectedReview._id)}
                    disabled={!replyText.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
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

export default Reviews;
