import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice.js";
import api from "../utils/api.js";
import {
  HiShoppingCart,
  HiHeart,
  HiStar,
  HiTruck,
  HiClock,
  HiFire,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [food, setFood] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    let mounted = true;
    const fetchFood = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/food/${id}`);
        const item = data?.data || data?.food || data;
        if (!mounted) return;
        setFood(item || null);
        const imgs =
          Array.isArray(item?.images) && item.images.length > 0
            ? item.images
            : [item?.image].filter(Boolean);
        setImages(imgs);
        setActiveImageIdx(0);
      } catch (e) {
        if (!mounted) return;
        setError(
          e.code === "ERR_NETWORK" || e.message?.includes("Network Error")
            ? "Cannot connect to server. Please make sure the backend is running."
            : "Failed to load food details. Please try again later."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const { data } = await api.get(`/food/${id}/reviews`);
        if (mounted) {
          setReviews(data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    const checkFavorite = async () => {
      if (!token) return;
      try {
        const { data } = await api.get("/user/favorites");
        if (mounted) {
          const isFav = data.some((fav) => (typeof fav === 'string' ? fav : fav._id) === id);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error("Failed to check favorites", error);
      }
    };

    fetchFood();
    fetchReviews();
    checkFavorite();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  const rating = useMemo(() => {
    if (!food?.rating && !reviews?.length) return 0;
    if (food?.rating) return Number(food.rating) || 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return reviews.length ? Number((sum / reviews.length).toFixed(1)) : 0;
  }, [food, reviews]);

  const handleAddToCart = () => {
    if (food) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(food));
      }
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/reviews", {
        food: food._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      // Refresh reviews
      const { data } = await api.get(`/food/${id}/reviews`);
      setReviews(data?.data || []);
    } catch (error) {
      console.error("Failed to submit review", error);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const { data } = await api.post("/user/favorites", { foodId: id });
      setIsFavorite(data.favorites.includes(id));
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-3xl animate-pulse" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
              <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-16 bg-gray-200 rounded-2xl animate-pulse w-1/2" />
              <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 text-center max-w-lg shadow-2xl border border-gray-100"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            className="text-8xl mb-6"
          >
            😢
          </motion.div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {error || "Food not found"}
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find what you're looking for
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/menu")}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-bold shadow-lg"
          >
            Browse Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pt-20 pb-16 overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold"
        >
          <HiChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Image Gallery Section */}
          <div className="space-y-4">
            <motion.div
              className="relative w-full aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <AnimatePresence mode="wait">
                {images[activeImageIdx] ? (
                  <motion.img
                    key={activeImageIdx}
                    src={images[activeImageIdx]}
                    alt={food.name}
                    initial={{ opacity: 0, scale: 1.2, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100"
                  >
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-4"
                    >
                      🍽️
                    </motion.span>
                    <p className="text-lg text-gray-500 font-medium">No Image Available</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiChevronLeft className="w-6 h-6 text-gray-800" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiChevronRight className="w-6 h-6 text-gray-800" />
                  </motion.button>
                </>
              )}

              {/* Floating badge */}
              {food.isPopular && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2"
                >
                  <HiFire className="w-4 h-4" />
                  Popular
                </motion.div>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-3"
              >
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${activeImageIdx === idx
                      ? "ring-4 ring-primary-500 ring-offset-2 shadow-xl"
                      : "hover:ring-2 hover:ring-gray-300 opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {activeImageIdx === idx && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-gradient-to-t from-primary-500/30 to-transparent"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Title and category */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3 mb-4"
              >
                <motion.span
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg"
                >
                  {food.category || "Delicious"}
                </motion.span>

                {food.isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold"
                  >
                    NEW
                  </motion.span>
                )}
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-4 leading-tight">
                {food.name}
              </h1>

              {/* Rating */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-5 py-3 rounded-2xl shadow-md border border-yellow-100"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <HiStar
                        className={`w-5 h-5 ${i < Math.floor(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    </motion.span>
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-700 leading-relaxed text-lg bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              {food.description ||
                "Experience the perfect blend of flavors crafted with love and the finest ingredients. A culinary masterpiece that will tantalize your taste buds."}
            </motion.p>

            {/* Price Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-green-100"
            >
              <div className="flex items-end gap-4 mb-2">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                  ৳{food.price}
                </span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <>
                    <span className="text-2xl text-gray-400 line-through mb-2">
                      ৳{food.originalPrice}
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold mb-2"
                    >
                      {Math.round(
                        ((food.originalPrice - food.price) / food.originalPrice) * 100
                      )}
                      % OFF
                    </motion.span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Inclusive of all taxes | Free delivery above ৳500
              </p>
            </motion.div>

            {/* Quantity selector */}
            {food.isAvailable && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3 bg-white rounded-full shadow-md px-2 py-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    −
                  </motion.button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={food.isAvailable ? { scale: 1.03, y: -2 } : {}}
                whileTap={food.isAvailable ? { scale: 0.97 } : {}}
                onClick={food.isAvailable ? handleAddToCart : undefined}
                disabled={!food.isAvailable}
                className={`relative flex-1 px-8 py-5 rounded-2xl font-black text-lg shadow-2xl overflow-hidden group ${food.isAvailable
                  ? "bg-gradient-to-r from-primary-500 via-primary-600 to-orange-500 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
              >
                {food.isAvailable && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}

                <AnimatePresence>
                  {isAddedToCart && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 3, opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                  )}
                </AnimatePresence>

                <span className="relative flex items-center justify-center gap-3">
                  {food.isAvailable ? (
                    isAddedToCart ? (
                      <>
                        <HiCheckCircle className="w-7 h-7" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <HiShoppingCart className="w-7 h-7" />
                        Add to Cart
                      </>
                    )
                  ) : (
                    <span>Currently Unavailable</span>
                  )}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className={`px-6 py-5 rounded-2xl font-bold transition-all duration-300 shadow-lg ${isFavorite
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-400 hover:border-pink-300 hover:text-pink-500"
                  }`}
              >
                <HiHeart className={`w-7 h-7 ${isFavorite ? "fill-current" : ""}`} />
              </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: HiTruck, text: "Free Delivery", color: "from-blue-500 to-cyan-500" },
                { icon: HiClock, text: "30 Min", color: "from-purple-500 to-pink-500" },
                { icon: HiFire, text: "Fresh & Hot", color: "from-orange-500 to-red-500" },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-white/50 to-white/20 rounded-2xl blur-xl transition-opacity" />
                  <div className="relative text-center p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 group-hover:shadow-xl transition-all">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-700 font-bold">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                Customer Reviews
              </h2>
              <p className="text-gray-600">See what others are saying</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Write a Review
            </motion.button>
          </div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 animate-pulse shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl block mb-6"
              >
                💬
              </motion.span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No reviews yet</h3>
              <p className="text-gray-600 text-lg mb-6">
                Be the first to share your experience!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-full font-bold shadow-lg"
              >
                Write the First Review
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev, idx) => (
                <motion.div
                  key={rev._id || rev.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 bg-gradient-to-br from-primary-400 via-primary-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg"
                      >
                        {(rev.user?.name || rev.userName || "A")[0].toUpperCase()}
                      </motion.div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {rev.user?.name || rev.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(rev.createdAt || rev.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <HiStar
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(rev.rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl">
                    {rev.comment}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
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
                <h2 className="text-3xl font-bold mb-2">Rate Food</h2>
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
    </div>
  );
}