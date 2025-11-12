import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiHome,
  HiShoppingBag,
  HiMenu,
  HiUsers,
  HiChartBar,
  HiCreditCard,
  HiStar,
  HiTicket,
  HiCog,
  HiTruck,
  HiX,
} from "react-icons/hi";

const Sidebar = ({ isOpen, isDarkMode, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const menuItems = [
    { icon: HiHome, label: "Dashboard", path: "/admin", badge: null },
    {
      icon: HiShoppingBag,
      label: "Orders",
      path: "/admin/orders",
      badge: "12",
    },
    { icon: HiMenu, label: "Menu", path: "/admin/menu", badge: null },
    { icon: HiUsers, label: "Users", path: "/admin/users", badge: null },
    {
      icon: HiChartBar,
      label: "Analytics",
      path: "/admin/analytics",
      badge: null,
    },
    {
      icon: HiCreditCard,
      label: "Transactions",
      path: "/admin/transactions",
      badge: "5",
    },
    { icon: HiStar, label: "Reviews", path: "/admin/reviews", badge: null },
    {
      icon: HiTicket,
      label: "Promo Codes",
      path: "/admin/promo-codes",
      badge: null,
    },
    { icon: HiTruck, label: "Delivery", path: "/admin/delivery", badge: null },
    { icon: HiCog, label: "Settings", path: "/admin/settings", badge: null },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? (isOpen ? 280 : 0) : (isOpen ? 256 : 80),
        x: isMobile ? (isOpen ? 0 : -280) : 0,
      }}
      className={`fixed left-0 top-0 h-full ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r shadow-lg z-40 overflow-hidden ${
        isMobile && !isOpen ? 'pointer-events-none' : ''
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-xl">
              🍕
            </div>
            {isOpen && (
              <div>
                <h1
                  className={`font-bold text-lg ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Food Lab
                </h1>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Admin Panel
                </p>
              </div>
            )}
          </div>
          {/* Close button for mobile */}
          {isMobile && isOpen && onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors`}
            >
              <HiX
                className={`w-6 h-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={() => {
              // Close sidebar on mobile when clicking a link
              if (isMobile && onClose) {
                onClose();
              }
            }}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : isDarkMode
                  ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats (when expanded) */}
      {isOpen && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Total Sales
              </span>
              <span
                className={`font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                ৳45,230
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Today
              </span>
              <span className="font-bold text-green-500">৳3,450</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
