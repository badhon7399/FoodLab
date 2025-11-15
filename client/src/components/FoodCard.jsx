import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice.js";
import { toggleFavorite } from "../redux/slices/favoritesSlice.js";
import { HiStar, HiPlus, HiHeart, HiShoppingCart } from "react-icons/hi";
import { BsFire } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FoodCard = ({ food: incomingFood }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const food = incomingFood || {
    _id: "demo",
    name: "Food Item",
    description: "Tasty and fresh.",
    image: "/images/placeholder.png",
    category: "Others",
    rating: 4.5,
    price: 199,
  };

  const isFav = useSelector((s) => s.favorites.ids.includes(food?._id));

  const goToDetail = () => {
    if (!food?._id) return;
    navigate(`/food/${food._id}`);
  };

  const handleAddToCart = () => {
    dispatch(addToCart(food));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer" onClick={goToDetail}>
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {food.isFeatured && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-accent-red to-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
            >
              <BsFire />
              <span>HOT</span>
            </motion.span>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              if (food?._id) dispatch(toggleFavorite(food._id));
            }}
            className={`ml-auto p-2 rounded-full backdrop-blur-lg transition-all ${
              isFav ? "bg-accent-red text-white" : "bg-white/80 text-gray-600"
            }`}
          >
            <HiHeart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
          </motion.button>
        </div>

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category Badge */}
        <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
          {food.category}
        </span>

        <h3
          className="font-heading font-bold text-xl mt-2 mb-2 text-dark group-hover:text-primary-500 transition-colors cursor-pointer"
          onClick={goToDetail}
        >
          {food.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {food.description}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <HiStar
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(food.rating)
                  ? "text-accent-yellow fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">({food.rating})</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-dark">৳{food.price}</span>
            {food.originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ৳{food.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 md:px-5 md:py-3 rounded-full font-semibold shadow-lg hover:from-primary-600 hover:to-primary-700 hover:shadow-glow active:scale-95 transition-all"
            aria-label="Add to cart"
            title="Add to cart"
          >
            <HiShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>
      </div>

      {/* Quick View Button (appears on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <button
          onClick={goToDetail}
          className="bg-white text-dark px-6 py-3 rounded-full font-semibold shadow-2xl pointer-events-auto hover:bg-gray-50 transition-colors"
        >
          Quick View
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FoodCard;
