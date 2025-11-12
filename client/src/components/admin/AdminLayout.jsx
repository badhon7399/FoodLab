import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import {
  HiMenuAlt2,
  HiBell,
  HiUser,
  HiLogout,
  HiMoon,
  HiSun,
  HiShoppingBag,
  HiCreditCard,
  HiHome,
} from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import api from "../../utils/api";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default on mobile
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Set initial state
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const { data } = await api.get("/admin/notifications?limit=10");
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <HiShoppingBag className="w-5 h-5" />;
      case "payment":
        return <HiCreditCard className="w-5 h-5" />;
      case "user":
        return <HiUser className="w-5 h-5" />;
      default:
        return <HiBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "order":
        return "text-blue-500 bg-blue-50";
      case "payment":
        return "text-green-500 bg-green-50";
      case "user":
        return "text-purple-500 bg-purple-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isDarkMode={isDarkMode}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } ml-0`}
      >
        {/* Top Navigation Bar */}
        <nav
          className={`sticky top-0 z-30 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b shadow-sm`}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  } transition-colors`}
                >
                  <HiMenuAlt2
                    className={`w-6 h-6 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                </button>

                <div>
                  <h2
                    className={`text-xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Food Lab Admin
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Welcome back, {user?.name}! 👋
                  </p>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {/* Back to Home */}
                <Link
                  to="/"
                  className={`hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-700 text-gray-200 hover:bg-gray-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <HiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/"
                  className={`md:hidden p-2 rounded-lg ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  } transition-colors`}
                  aria-label="Go to Home"
                >
                  <HiHome className="w-5 h-5" />
                </Link>
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  } transition-colors`}
                >
                  {isDarkMode ? (
                    <HiSun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <HiMoon className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-lg ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } transition-colors`}
                  >
                    <HiBell
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-2 w-72 sm:w-80 md:w-96 ${
                          isDarkMode ? "bg-gray-800" : "bg-white"
                        } rounded-xl shadow-2xl border ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } overflow-hidden z-50`}
                      >
                        <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`font-bold text-sm md:text-base ${
                                isDarkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              Notifications
                            </h3>
                            {unreadCount > 0 && (
                              <span className="text-xs md:text-sm text-primary-500 font-semibold">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                          {loadingNotifications ? (
                            <div className="p-8 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                              <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Loading...
                              </p>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <HiBell className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                No notifications
                              </p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                to={notification.link || "#"}
                                onClick={() => setShowNotifications(false)}
                                className={`block p-3 md:p-4 border-b ${
                                  isDarkMode
                                    ? "border-gray-700 hover:bg-gray-700"
                                    : "border-gray-100 hover:bg-gray-50"
                                } transition-colors ${
                                  notification.unread
                                    ? isDarkMode
                                      ? "bg-blue-900/20"
                                      : "bg-blue-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(
                                      notification.type
                                    )}`}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p
                                        className={`text-xs md:text-sm font-semibold ${
                                          isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                      >
                                        {notification.title}
                                      </p>
                                      {notification.unread && (
                                        <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1"></span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-xs md:text-sm mt-1 ${
                                        isDarkMode ? "text-gray-300" : "text-gray-700"
                                      }`}
                                    >
                                      {notification.message}
                                    </p>
                                    {notification.amount && (
                                      <p
                                        className={`text-xs md:text-sm font-semibold mt-1 ${
                                          isDarkMode ? "text-green-400" : "text-green-600"
                                        }`}
                                      >
                                        ৳{notification.amount.toLocaleString()}
                                      </p>
                                    )}
                                    <p
                                      className={`text-xs mt-1 ${
                                        isDarkMode ? "text-gray-500" : "text-gray-500"
                                      }`}
                                    >
                                      {notification.timeAgo || "Just now"}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                            <Link
                              to="/admin/orders"
                              onClick={() => setShowNotifications(false)}
                              className="text-primary-500 text-xs md:text-sm font-semibold hover:text-primary-600"
                            >
                              View All Notifications
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-lg ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    } transition-colors`}
                  >
                    <HiLogout className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
