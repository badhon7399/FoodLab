import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { HiCheckCircle, HiHome, HiShoppingBag } from "react-icons/hi";
import Confetti from "react-confetti";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Stop confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);
  useEffect(() => {
  sessionStorage.removeItem('placingOrder');
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <HiCheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Your order has been successfully placed and is being prepared.
        </p>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="font-mono font-bold text-gray-900">
            #{orderId?.slice(-8)}
          </p>
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800 mb-1">Estimated Delivery Time</p>
          <p className="text-2xl font-bold text-blue-900">25-35 minutes</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/orders`}
            className="flex items-center justify-center space-x-2 w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiShoppingBag className="w-5 h-5" />
            <span>Track Order</span>
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <HiHome className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
