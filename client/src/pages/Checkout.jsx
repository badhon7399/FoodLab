import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  HiShoppingCart,
  HiCreditCard,
  HiLocationMarker,
  HiPhone,
  HiUser,
  HiMail,
  HiTicket,
  HiCheckCircle,
  HiX,
  HiExclamation,
  HiChevronLeft,
  HiTruck,
  HiCash,
  HiClock,
} from "react-icons/hi";
import axios from "axios";
import { clearCart } from "../redux/slices/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Delivery Details State
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    hall: user?.hall || "",
    department: user?.department || "",
    roomNumber: "",
    instructions: "",
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Pricing
  const deliveryFee = total >= 200 ? 0 : 30;
  const subtotal = total;
  const discount = promoDiscount;
  const finalTotal = subtotal + deliveryFee - discount;

  // Halls list
  const halls = [
    "Kabi Kazi Nazrul Islam Hall",
    "Saheed Abu Sayed Hall",
    "Shah Hall",
    "Saheed Tarek Huda Hall",
    "Muktizoddha Hall",
  
    "Others",
  ];

  useEffect(() => {
    // Redirect if cart is empty (but skip when we're in the middle of placing an order)
    const placing = sessionStorage.getItem('placingOrder') === '1';
    if (items.length === 0 && !placing) {
      navigate("/menu");
    }
    // If items exist but the flag is still set (stale), clear it
    if (items.length > 0 && placing) {
      sessionStorage.removeItem('placingOrder');
    }
  }, [items, navigate]);

  // Handle Apply Promo Code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setValidatingPromo(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/promo/validate`,
        {
          code: promoCode,
          orderAmount: subtotal,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.success) {
        setPromoDiscount(data.discount);
        setPromoApplied(true);
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid promo code");
      setPromoDiscount(0);
      setPromoApplied(false);
    } finally {
      setValidatingPromo(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoDiscount(0);
    setPromoApplied(false);
  };

  // Validate delivery details
  const validateDetails = () => {
    if (!deliveryDetails.name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!deliveryDetails.phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!/^(\+88)?01[3-9]\d{8}$/.test(deliveryDetails.phone)) {
      setError("Please enter a valid Bangladesh phone number");
      return false;
    }
    if (!deliveryDetails.hall) {
      setError("Please select your hall");
      return false;
    }
    return true;
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    setError("");
    if (validateDetails()) {
      setStep(2);
    }
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      setError("Please agree to terms and conditions");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create order
      const orderData = {
        items: items.map((item) => ({
          food: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryDetails,
        subtotal,
        deliveryFee,
        discount,
        totalAmount: finalTotal,
        paymentMethod,
        promoCode: promoApplied ? promoCode : undefined,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        orderData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.success) {
        // set a flag to prevent empty-cart redirect during order completion
        sessionStorage.setItem('placingOrder', '1');
        // If Bkash payment, initiate payment
        if (paymentMethod === "Bkash") {
          await initiateBkashPayment(data.order._id, finalTotal);
        } else {
          // Cash on Delivery - Go to success page
          dispatch(clearCart());
          navigate(`/order-success/${data.order._id}`);
          // clear the flag after navigation is triggered
          setTimeout(() => {
            sessionStorage.removeItem('placingOrder');
          }, 0);
        }
      }
    } catch (err) {
      // ensure the placing flag is cleared on failure
      sessionStorage.removeItem('placingOrder');
      setError(err.response?.data?.message || "Failed to place order");
      setLoading(false);
    }
  };

  // Initiate Bkash Payment
  const initiateBkashPayment = async (orderId, amount) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/bkash/create`,
        {
          orderId,
          amount,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.success && data.bkashURL) {
        // Redirect to Bkash payment page
        window.location.href = data.bkashURL;
      }
    } catch (err) {
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/cart"))}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <HiChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your order in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { number: 1, label: "Delivery Details" },
              { number: 2, label: "Payment" },
              { number: 3, label: "Confirmation" },
            ].map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.number
                        ? "bg-primary-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.number ? (
                      <HiCheckCircle className="w-6 h-6" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      step >= s.number ? "text-primary-500" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      step > s.number ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
            >
              <div className="flex items-center space-x-3">
                <HiExclamation className="w-6 h-6 text-red-500" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-primary-50 p-3 rounded-xl">
                    <HiLocationMarker className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Delivery Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={deliveryDetails.name}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            name: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={deliveryDetails.phone}
                          onChange={(e) =>
                            setDeliveryDetails({
                              ...deliveryDetails,
                              phone: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <div className="relative">
                        <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={deliveryDetails.email}
                          onChange={(e) =>
                            setDeliveryDetails({
                              ...deliveryDetails,
                              email: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hall & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hall *
                      </label>
                      <select
                        value={deliveryDetails.hall}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            hall: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select your hall</option>
                        {halls.map((hall) => (
                          <option key={hall} value={hall}>
                            {hall}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.roomNumber}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            roomNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="e.g., 304"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryDetails.department}
                      onChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="e.g., Computer Science & Engineering"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryDetails.instructions}
                      onChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          instructions: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Payment Method Selection */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary-50 p-3 rounded-xl">
                      <HiCreditCard className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Payment Method
                      </h2>
                      <p className="text-sm text-gray-500">
                        Choose your preferred payment option
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Bkash */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "Bkash"
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="payment"
                          value="Bkash"
                          checked={paymentMethod === "Bkash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-pink-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="bg-pink-500 p-2 rounded-lg">
                            <HiCreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Bkash</p>
                            <p className="text-xs text-gray-500">
                              Pay with your Bkash account
                            </p>
                          </div>
                        </div>
                      </div>
                      {paymentMethod === "Bkash" && (
                        <HiCheckCircle className="w-6 h-6 text-pink-500" />
                      )}
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="payment"
                          value="Cash on Delivery"
                          checked={paymentMethod === "Cash on Delivery"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-green-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-500 p-2 rounded-lg">
                            <HiCash className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Cash on Delivery
                            </p>
                            <p className="text-xs text-gray-500">
                              Pay when you receive your order
                            </p>
                          </div>
                        </div>
                      </div>
                      {paymentMethod === "Cash on Delivery" && (
                        <HiCheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </label>
                  </div>

                  {/* Payment Info */}
                  {paymentMethod === "Bkash" && (
                    <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-xl">
                      <p className="text-sm text-pink-800">
                        💡 You will be redirected to Bkash payment gateway after
                        placing your order.
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 text-primary-500 rounded mt-1"
                    />
                    <div className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-primary-500 font-semibold hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-primary-500 font-semibold hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </label>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-6 h-6" />
                      <span>Place Order - ৳{finalTotal}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  🔒 Your payment information is secure and encrypted
                </p>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <HiTicket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      disabled={promoApplied}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none disabled:bg-gray-100"
                      placeholder="Enter code"
                    />
                  </div>
                  {promoApplied ? (
                    <button
                      onClick={handleRemovePromo}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      disabled={validatingPromo}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  )}
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
                    <HiCheckCircle className="w-4 h-4" />
                    <span>Promo code applied!</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-৳{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center space-x-1">
                    <HiTruck className="w-4 h-4" />
                    <span>Delivery Fee</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      deliveryFee === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {deliveryFee === 0 ? "FREE" : `৳${deliveryFee}`}
                  </span>
                </div>

                {total < 200 && deliveryFee > 0 && (
                  <p className="text-xs text-orange-600">
                    💡 Add ৳{200 - total} more to get FREE delivery
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-2xl font-bold text-gray-900 mt-4">
                <span>Total</span>
                <span className="text-primary-500">৳{finalTotal}</span>
              </div>

              {/* Estimated Delivery Time */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <HiClock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Estimated Delivery
                  </span>
                </div>
                <p className="text-sm text-blue-800">25-35 minutes</p>
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500 text-xs">
                <HiCheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
