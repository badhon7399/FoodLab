import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiUser,
  HiPhone,
  HiAcademicCap,
  HiLocationMarker,
  HiCheckCircle,
  HiExclamation,
  HiArrowRight,
} from 'react-icons/hi';
import { register } from '../redux/slices/authSlice';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // Multi-step form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    hall: '',
    department: '',
    studentId: '',
    agreedToTerms: false,
  });

  const halls = [
    'Amar Ekushey Hall',
    'Shaheed Abdur Rab Hall',
    'Shah Jalal Hall',
    'Shamsun Nahar Hall',
    'Dr. M. A. Rashid Hall',
    'Others',
  ];

  const departments = [
    'Civil Engineering',
    'Electrical & Electronic Engineering',
    'Mechanical Engineering',
    'Computer Science & Engineering',
    'Architecture',
    'Urban & Regional Planning',
    'Building Engineering & Construction Management',
    'Chemical Engineering',
    'Petroleum & Mining Engineering',
    'Materials & Metallurgical Engineering',
    'Industrial & Production Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Humanities',
    'Others',
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  const validateStep1 = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+88)?01[3-9]\d{8}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid Bangladesh phone number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.hall) {
      errors.hall = 'Please select your hall';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    try {
      await dispatch(register(formData)).unwrap();
      // Show success message and redirect
      navigate('/login', {
        state: { message: 'Account created successfully! Please login.' },
      });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 flex items-center justify-center p-4 py-12">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Sidebar - Progress */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 p-8 lg:p-12 text-white">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🍕</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Food Lab</h1>
                    <p className="text-white/80 text-sm">CUET Campus</p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-white/90">Join the Food Lab family today!</p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= 1
                        ? 'bg-white text-primary-500'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {step > 1 ? <HiCheckCircle className="w-6 h-6" /> : '1'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Account Details</h3>
                    <p className="text-white/70 text-sm">Basic information and credentials</p>
                  </div>
                </div>

                <div className="ml-5 w-0.5 h-8 bg-white/20" />

                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= 2
                        ? 'bg-white text-primary-500'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">CUET Details</h3>
                    <p className="text-white/70 text-sm">Hall and department information</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-12 space-y-3">
                {[
                  'Order from 50+ menu items',
                  'Track orders in real-time',
                  'Exclusive student discounts',
                  'Fast 30-minute delivery',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <HiCheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-white/90 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:col-span-3 p-8 lg:p-12">
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

              <form onSubmit={step === 1 ? (e) => e.preventDefault() : handleSubmit}>
                {/* Step 1: Account Details */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h3>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            validationErrors.name
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
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

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            validationErrors.phone
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                          }`}
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
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
                          placeholder="Create a strong password"
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
                      <p className="mt-2 text-xs text-gray-500">
                        Must contain uppercase, lowercase, and number
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            validationErrors.confirmPassword
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                          }`}
                          placeholder="Re-enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <HiEyeOff className="w-5 h-5" />
                          ) : (
                            <HiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Continue</span>
                      <HiArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: CUET Details */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">CUET Details</h3>

                    {/* Hall */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hall *
                      </label>
                      <div className="relative">
                        <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="hall"
                          value={formData.hall}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            validationErrors.hall
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                          }`}
                        >
                          <option value="">Select your hall</option>
                          {halls.map((hall) => (
                            <option key={hall} value={hall}>
                              {hall}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.hall && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.hall}</p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department (Optional)
                      </label>
                      <div className="relative">
                        <HiAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        >
                          <option value="">Select your department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Student ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="e.g., U1804001"
                      />
                    </div>

                    {/* Terms & Conditions */}
                    <div className="pt-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreedToTerms"
                          checked={formData.agreedToTerms}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary-500 font-semibold hover:underline">
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-primary-500 font-semibold hover:underline">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      {validationErrors.agreedToTerms && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.agreedToTerms}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <HiCheckCircle className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>

              {/* Login Link */}
              <p className="mt-8 text-center text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-500 hover:text-primary-600"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;