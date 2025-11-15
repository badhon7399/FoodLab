import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiExclamation,
  HiArrowRight,
} from 'react-icons/hi';
import { login } from '../redux/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect admins to admin panel, others to their intended destination or home
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await dispatch(login(formData)).unwrap();
      // Redirect admins to admin panel immediately after login
      if (result?.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // Redirect will happen via useEffect for regular users
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Error is handled by Redux
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 flex items-center justify-center p-4 pt-24 md:pt-28">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center text-white p-12"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <span className="text-4xl">🍕</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold">Food Lab</h1>
                <p className="text-white/80">CUET Campus</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Login to order delicious food and track your orders in real-time.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              {[
                { icon: '🍔', text: '50+ Delicious Menu Items' },
                { icon: '⚡', text: 'Fast 30-Min Delivery' },
                { icon: '✓', text: 'Hygienic & Fresh Food' },
                { icon: '💰', text: 'Student-Friendly Prices' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-xl p-4"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍕</span>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">Food Lab</h1>
                  <p className="text-sm text-gray-500">CUET Campus</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
              >
                <div className="flex items-center space-x-3">
                  <HiExclamation className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      validationErrors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      validationErrors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <HiEyeOff className="w-5 h-5" />
                    ) : (
                      <HiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-500 hover:text-primary-600"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-primary-500 hover:text-primary-600"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;