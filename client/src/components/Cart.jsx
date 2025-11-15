import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../redux/slices/cartSlice";
import {
  HiX,
  HiMinus,
  HiPlus,
  HiTrash,
  HiShoppingBag,
  HiTag,
  HiTruck,
  HiCheckCircle,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const ModernCart = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Lock background scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      const htmlOverflow = document.documentElement.style.overflow;
      const bodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = htmlOverflow;
        document.body.style.overflow = bodyOverflow;
      };
    }
  }, [isOpen]);

  const deliveryFee = total > 200 ? 0 : 30;
  const discount = appliedPromo ? total * 0.1 : 0;
  const finalTotal = total + deliveryFee - discount;

  const handleApplyPromo = () => {
    if (promoCode === "CUET10") {
      setAppliedPromo({ code: "CUET10", discount: 10 });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 h-full w-full md:right-0 md:inset-auto md:w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-x-hidden overflow-y-auto md:overflow-y-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <HiShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <p className="text-white/80">{items.length} items added</p>
                </div>
              </div>

              {/* Free Delivery Progress */}
              {total < 200 && (
                <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Add ৳{200 - total} more for FREE delivery</span>
                    <HiTruck className="w-5 h-5" />
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(total / 200) * 100}%` }}
                      className="h-full bg-accent-yellow"
                    />
                  </div>
                </div>
              )}

              {total >= 200 && (
                <div className="mt-4 bg-accent-green/20 backdrop-blur-lg rounded-lg p-3 flex items-center space-x-2">
                  <HiCheckCircle className="w-5 h-5 text-accent-green" />
                  <span className="text-sm font-medium">
                    You qualify for FREE delivery! 🎉
                  </span>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="p-6 space-y-4 bg-gray-50 md:flex-1 md:overflow-y-auto">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <HiShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some delicious items to get started!
                  </p>
                  <Link to="/menu" onClick={onClose}>
                    <button className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
                      Browse Menu
                    </button>
                  </Link>
                </motion.div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Item Image */}
                        <div className="relative flex-shrink-0 self-center sm:self-auto">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {item.isFeatured && (
                            <span className="absolute -top-2 -right-2 bg-accent-red text-white text-xs px-2 py-1 rounded-full font-bold">
                              HOT
                            </span>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-dark text-lg leading-tight">
                                {item.name}
                              </h3>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {item.category}
                              </span>
                            </div>
                            <button
                              onClick={() => dispatch(removeFromCart(item._id))}
                              className="text-gray-400 hover:text-accent-red transition-colors p-1"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                            <div className="text-primary-500 font-bold text-xl">
                              ৳{item.price * item.quantity}
                              <span className="text-sm text-gray-500 font-normal ml-1">
                                (৳{item.price} each)
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    dispatch(
                                      updateQuantity({
                                        id: item._id,
                                        quantity: item.quantity - 1,
                                      })
                                    );
                                  }
                                }}
                                className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                              >
                                <HiMinus className="w-4 h-4" />
                              </motion.button>

                              <span className="w-12 text-center font-bold text-dark">
                                {item.quantity}
                              </span>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      id: item._id,
                                      quantity: item.quantity + 1,
                                    })
                                  )
                                }
                                className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                              >
                                <HiPlus className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => dispatch(clearCart())}
                      className="w-full text-accent-red font-semibold py-3 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <HiTrash className="w-5 h-5" />
                      <span>Clear All Items</span>
                    </motion.button>
                  )}
                </>
              )}
            </div>

            {/* Footer - Checkout Section */}
            {items.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-6 space-y-4">
                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <HiTag className="w-4 h-4" />
                    <span>Promo Code</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code (e.g., CUET10)"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyPromo}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors w-full sm:w-auto"
                    >
                      Apply
                    </motion.button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center space-x-2 text-accent-green text-sm">
                      <HiCheckCircle className="w-4 h-4" />
                      <span>
                        Code "{appliedPromo.code}" applied!{" "}
                        {appliedPromo.discount}% off
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">৳{total}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-accent-green">
                      <span>Discount ({appliedPromo.discount}%)</span>
                      <span className="font-semibold">
                        -৳{discount.toFixed(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center space-x-1">
                      <HiTruck className="w-4 h-4" />
                      <span>Delivery Fee</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        deliveryFee === 0 ? "text-accent-green" : ""
                      }`}
                    >
                      {deliveryFee === 0 ? "FREE" : `৳${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-2xl font-bold text-dark pt-3 border-t-2 border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-500">
                      ৳{finalTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link to="/checkout" onClick={onClose}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </Link>

                <p className="text-center text-xs text-gray-500">
                  🔒 Secure checkout powered by Bkash
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModernCart;
