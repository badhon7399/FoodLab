import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiStar } from 'react-icons/hi';
import { BsFire } from 'react-icons/bs';

const Hero = () => {
  const foodImages = [
    '/images/pizza.png',
    '/images/burger.png',
    '/images/shwarma.png',
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-dark overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-yellow rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-green rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-6 border border-white/20"
            >
              <BsFire className="text-accent-yellow" />
              <span className="text-sm font-medium">Trending on Campus</span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Tasty, Healthy,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow to-white">
                {' '}Hygienic
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-4">
              Delicious food made with love, exclusively for CUETians ❤️
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className="w-5 h-5 text-accent-yellow fill-current" />
                ))}
                <span className="ml-2 font-semibold">4.8</span>
              </div>
              <div className="h-6 w-px bg-white/30" />
              <span className="font-medium">500+ Happy Students</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-accent-yellow text-dark px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-2xl"
                >
                  <span>Order Now</span>
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
                >
                  View Menu
                </motion.button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <span>100% Hygienic</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-400/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <span>Fast Delivery</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Floating Food Images */}
          <div className="relative h-[600px] hidden lg:block">
            {foodImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }
                }}
                className={`absolute w-72 h-72 ${
                  index === 0 ? 'top-0 right-20' :
                  index === 1 ? 'top-40 left-0' :
                  'bottom-0 right-0'
                }`}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/20 to-transparent rounded-full blur-2xl" />
                  <img 
                    src={img} 
                    alt="Food" 
                    className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                  />
                </div>
              </motion.div>
            ))}

            {/* Decorative circles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-white/10 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0,64 C240,100 480,100 720,64 C960,28 1200,28 1440,64 L1440,120 L0,120 Z" 
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};

export default Hero;