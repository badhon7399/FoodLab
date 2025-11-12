import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiMail,
  HiArrowLeft,
  HiCheckCircle,
  HiExclamation,
} from 'react-icons/hi';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <HiMail className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <HiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h3>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                <div className="flex items-center space-x-3">
                  <HiExclamation className="w-6 h-6 text-red-500" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;