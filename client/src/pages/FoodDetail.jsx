import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice.js";
import api from "../utils/api.js";

export default function FoodDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [food, setFood] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

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

    fetchFood();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        let res;
        try {
          res = await api.get(`/food/${id}/reviews`);
        } catch (_) {
          try {
            res = await api.get(`/reviews/food/${id}`);
          } catch (_) {
            res = await api.get(`/reviews`, { params: { food: id } });
          }
        }
        const list =
          res?.data?.data ||
          res?.data?.reviews ||
          (Array.isArray(res?.data) ? res.data : []);
        if (!mounted) return;
        setReviews(Array.isArray(list) ? list : []);
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [id]);

  const rating = useMemo(() => {
    if (!food?.rating && !reviews?.length) return 0;
    if (food?.rating) return Number(food.rating) || 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return reviews.length ? Number((sum / reviews.length).toFixed(1)) : 0;
  }, [food, reviews]);

  const handleAddToCart = () => {
    if (food) {
      dispatch(addToCart(food));
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-primary-50 via-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="w-full h-80 md:h-[28rem] bg-gray-200 rounded-3xl animate-pulse" />
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-b from-primary-50 via-white to-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur rounded-3xl p-12 text-center max-w-lg shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-7xl mb-6"
          >
            😔
          </motion.div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            {error || "Food not found"}
          </h3>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-amber-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Image Gallery Section */}
          <div className="space-y-6">
            <motion.div
              className="relative w-full h-80 md:h-[32rem] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AnimatePresence mode="wait">
                {images[activeImageIdx] ? (
                  <motion.img
                    key={activeImageIdx}
                    src={images[activeImageIdx]}
                    alt={food.name}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <span className="text-6xl">🍽️</span>
                      <p className="mt-2">No Image Available</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
              
              {/* Image Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`transition-all duration-300 ${
                        activeImageIdx === idx
                          ? "w-8 h-2 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/75"
                      } rounded-full`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3"
              >
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-16 rounded-2xl overflow-hidden transition-all duration-300 ${
                      activeImageIdx === idx
                        ? "ring-4 ring-primary-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {activeImageIdx === idx && (
                      <motion.div
                        layoutId="activeThumb"
                        className="absolute inset-0 bg-black/20"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                {food.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-bold shadow-lg"
                >
                  {food.category || "Delicious"}
                </motion.span>
                
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {rating} ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 leading-relaxed text-lg mb-8"
              >
                {food.description || "Experience the perfect blend of flavors crafted with love and the finest ingredients."}
              </motion.p>

              {/* Price Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-baseline gap-4 mb-8"
              >
                <span className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                  ৳{food.price}
                </span>
                {food.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ৳{food.originalPrice}
                  </span>
                )}
                {food.originalPrice && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                    {Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)}% OFF
                  </span>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="relative flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                >
                  <AnimatePresence>
                    {isAddedToCart && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 20 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-500 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-2xl">{isAddedToCart ? "✓" : "🛒"}</span>
                    {isAddedToCart ? "Added!" : "Add to Cart"}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 shadow-lg"
                >
                  <span className="text-2xl">♥</span>
                </motion.button>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4 mt-8"
              >
                {[
                  { icon: "🚚", text: "Free Delivery" },
                  { icon: "⚡", text: "Fast Service" },
                  { icon: "✨", text: "Fresh Food" }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="text-center p-4 bg-white/70 backdrop-blur rounded-2xl"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <p className="text-sm text-gray-600 font-medium">{feature.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-2 bg-primary-100 text-primary-600 rounded-full font-semibold hover:bg-primary-200 transition-colors"
            >
              Write a Review
            </motion.button>
          </div>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/90 backdrop-blur rounded-3xl shadow-lg"
            >
              <span className="text-6xl">💬</span>
              <p className="mt-4 text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-4">
              {reviews.map((rev, idx) => (
                <motion.div
                  key={rev._id || rev.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(rev.user?.name || rev.userName || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {rev.user?.name || rev.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(rev.createdAt || rev.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < Math.round(rev.rating || 0) ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{rev.comment}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}