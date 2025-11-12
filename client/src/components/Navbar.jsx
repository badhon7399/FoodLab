import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMenuAlt3,
  HiX,
  HiShoppingCart,
  HiUser,
  HiCog,
  HiLogout,
} from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef(null);
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Check if user is admin (support both role and isAdmin for backward compatibility)
  const isAdmin = user?.role === "admin" || user?.isAdmin === true;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Determine if we should use dark text
  // Use white text only on home page when not scrolled
  const isHomePage = location.pathname === "/";
  const shouldUseDarkText = !isHomePage || isScrolled;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-white/80 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-glow"
            >
              <span className="text-2xl">🍕</span>
            </motion.div>
            <div>
              <h1
                className={`text-2xl font-heading font-bold ${
                  shouldUseDarkText ? "text-dark" : "text-white"
                }`}
              >
                Food Lab
              </h1>
              <p
                className={`text-xs ${
                  shouldUseDarkText ? "text-gray-600" : "text-gray-200"
                }`}
              >
                CUET Campus
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="relative group">
                <span
                  className={`font-medium transition-colors ${
                    shouldUseDarkText
                      ? "text-dark hover:text-primary-500"
                      : "text-white hover:text-accent-yellow"
                  } ${
                    location.pathname === link.path ? "text-primary-500" : ""
                  }`}
                >
                  {link.name}
                </span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="relative group">
                <span
                  className={`font-medium transition-colors ${
                    shouldUseDarkText
                      ? "text-dark hover:text-primary-500"
                      : "text-white hover:text-accent-yellow"
                  } ${
                    location.pathname.startsWith("/admin")
                      ? "text-primary-500"
                      : ""
                  }`}
                >
                  Admin
                </span>
                {location.pathname.startsWith("/admin") && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <motion.button
              onClick={onCartClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-full ${
                shouldUseDarkText ? "bg-gray-100" : "bg-white/20"
              }`}
            >
              <HiShoppingCart
                className={`w-6 h-6 ${
                  shouldUseDarkText ? "text-dark" : "text-white"
                }`}
              />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-full"
                >
                  <HiUser className="w-5 h-5" />
                  <span className="hidden md:block font-medium">
                    {user.name}
                  </span>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <HiUser className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">
                            My Profile
                          </span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <HiCog className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-700 font-medium">
                              Admin Panel
                            </span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                        >
                          <HiLogout className="w-5 h-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-500 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:bg-primary-600"
                >
                  Login
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <HiX
                  className={`w-7 h-7 ${
                    shouldUseDarkText ? "text-dark" : "text-white"
                  }`}
                />
              ) : (
                <HiMenuAlt3
                  className={`w-7 h-7 ${
                    shouldUseDarkText ? "text-dark" : "text-white"
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 bg-white rounded-lg shadow-xl overflow-hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-6 py-3 hover:bg-gray-50 ${
                    location.pathname === link.path
                      ? "bg-primary-50 text-primary-500"
                      : "text-dark"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-6 py-3 hover:bg-gray-50 ${
                    location.pathname.startsWith("/admin")
                      ? "bg-primary-50 text-primary-500"
                      : "text-dark"
                  }`}
                >
                  Admin
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
