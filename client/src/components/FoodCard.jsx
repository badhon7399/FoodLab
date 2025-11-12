import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice.js";
import { HiStar, HiPlus, HiHeart } from "react-icons/hi";
import { BsFire } from "react-icons/bs";
import { useState } from "react";

const FoodCard = ({ food: incomingFood }) => {
  const dispatch = useDispatch();
  const [isFavorite, setIsFavorite] = useState(false);

  const food = incomingFood || {
    _id: "demo",
    name: "Food Item",
    description: "Tasty and fresh.",
    image: "/images/placeholder.png",
    category: "Others",
    rating: 4.5,
    price: 199,
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
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
            onClick={() => setIsFavorite(!isFavorite)}
            className={`ml-auto p-2 rounded-full backdrop-blur-lg transition-all ${
              isFavorite
                ? "bg-accent-red text-white"
                : "bg-white/80 text-gray-600"
            }`}
          >
            <HiHeart
              className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
            />
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

        <h3 className="font-heading font-bold text-xl mt-2 mb-2 text-dark group-hover:text-primary-500 transition-colors">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 rounded-xl shadow-lg hover:shadow-glow transition-all"
          >
            <HiPlus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Quick View Button (appears on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <button className="bg-white text-dark px-6 py-3 rounded-full font-semibold shadow-2xl pointer-events-auto hover:bg-gray-50 transition-colors">
          Quick View
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FoodCard;
