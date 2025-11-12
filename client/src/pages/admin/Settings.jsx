import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiSave,
  HiUser,
  HiMail,
  HiLockClosed,
  HiBell,
  HiCreditCard,
  HiShoppingBag,
  HiCog,
  HiUpload,
} from "react-icons/hi";
import axios from "axios";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Food Lab",
    siteDescription: "Tasty, Healthy, Hygienic - Made for Cuetians",
    contactEmail: "support@foodlab.com",
    contactPhone: "+880 1234567890",
    address: "Chittagong University of Engineering and Technology",
  });

  const [profileSettings, setProfileSettings] = useState({
    name: "Admin User",
    email: "admin@foodlab.com",
    phone: "+880 1234567890",
    avatar: "",
  });

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewOrder: true,
    emailNewUser: true,
    emailLowStock: false,
    pushNewOrder: true,
    pushPaymentReceived: true,
    pushNewReview: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    bkashEnabled: true,
    bkashMerchantNumber: "",
    codEnabled: true,
    deliveryFee: 30,
    freeDeliveryThreshold: 200,
  });

  const [orderSettings, setOrderSettings] = useState({
    orderPrefix: "ORD",
    autoApprove: false,
    minOrderAmount: 0,
    maxOrderAmount: 5000,
    estimatedDeliveryTime: 30,
  });

  const tabs = [
    { id: "general", name: "General", icon: HiCog },
    { id: "profile", name: "Profile", icon: HiUser },
    { id: "password", name: "Password", icon: HiLockClosed },
    { id: "notifications", name: "Notifications", icon: HiBell },
    { id: "payment", name: "Payment", icon: HiCreditCard },
    { id: "orders", name: "Orders", icon: HiShoppingBag },
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save based on active tab
      const endpoint = `${
        import.meta.env.VITE_API_URL
      }/admin/settings/${activeTab}`;
      let data;

      switch (activeTab) {
        case "general":
          data = generalSettings;
          break;
        case "profile":
          data = profileSettings;
          break;
        case "password":
          data = passwordSettings;
          break;
        case "notifications":
          data = notificationSettings;
          break;
        case "payment":
          data = paymentSettings;
          break;
        case "orders":
          data = orderSettings;
          break;
      }

      await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Settings saved successfully!");

      // Reset password fields
      if (activeTab === "password") {
        setPasswordSettings({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* General Settings */}
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    General Settings
                  </h2>
                  <p className="text-gray-500">
                    Configure your application's basic information
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            contactEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.contactPhone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            contactPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={generalSettings.address}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Profile Settings
                  </h2>
                  <p className="text-gray-500">
                    Update your personal information
                  </p>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profileSettings.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <HiUpload className="w-5 h-5" />
                      <span className="font-semibold">Upload Photo</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileSettings.name}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) =>
                          setProfileSettings({
                            ...profileSettings,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileSettings.phone}
                        onChange={(e) =>
                          setProfileSettings({
                            ...profileSettings,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password Settings */}
            {activeTab === "password" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Change Password
                  </h2>
                  <p className="text-gray-500">
                    Update your password to keep your account secure
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordSettings.currentPassword}
                      onChange={(e) =>
                        setPasswordSettings({
                          ...passwordSettings,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordSettings.newPassword}
                      onChange={(e) =>
                        setPasswordSettings({
                          ...passwordSettings,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordSettings.confirmPassword}
                      onChange={(e) =>
                        setPasswordSettings({
                          ...passwordSettings,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains at least one number</li>
                      <li>• Contains at least one special character</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Notification Preferences
                  </h2>
                  <p className="text-gray-500">
                    Choose how you want to receive notifications
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "emailNewOrder", label: "New order received" },
                        { key: "emailNewUser", label: "New user registration" },
                        { key: "emailLowStock", label: "Low stock alerts" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <HiMail className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {item.label}
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key]}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "pushNewOrder", label: "New order received" },
                        {
                          key: "pushPaymentReceived",
                          label: "Payment received",
                        },
                        { key: "pushNewReview", label: "New review posted" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <HiBell className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {item.label}
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key]}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Settings
                  </h2>
                  <p className="text-gray-500">
                    Configure payment methods and delivery fees
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Bkash Settings */}
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-pink-500 p-3 rounded-xl">
                          <HiCreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Bkash Payment
                          </h3>
                          <p className="text-sm text-gray-600">
                            Digital wallet payment
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.bkashEnabled}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bkashEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>

                    {paymentSettings.bkashEnabled && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bkash Merchant Number
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.bkashMerchantNumber}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              bkashMerchantNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                          placeholder="+880 1XXXXXXXXX"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-3 rounded-xl">
                          <HiCreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Cash on Delivery
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pay when you receive
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.codEnabled}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              codEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Fee (৳)
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.deliveryFee}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            deliveryFee: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Free Delivery Above (৳)
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.freeDeliveryThreshold}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            freeDeliveryThreshold: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Settings */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order Settings
                  </h2>
                  <p className="text-gray-500">
                    Configure order processing preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order ID Prefix
                    </label>
                    <input
                      type="text"
                      value={orderSettings.orderPrefix}
                      onChange={(e) =>
                        setOrderSettings({
                          ...orderSettings,
                          orderPrefix: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="ORD"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Auto-Approve Orders
                      </h4>
                      <p className="text-sm text-gray-600">
                        Automatically approve new orders without manual review
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderSettings.autoApprove}
                        onChange={(e) =>
                          setOrderSettings({
                            ...orderSettings,
                            autoApprove: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Min. Order Amount (৳)
                      </label>
                      <input
                        type="number"
                        value={orderSettings.minOrderAmount}
                        onChange={(e) =>
                          setOrderSettings({
                            ...orderSettings,
                            minOrderAmount: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max. Order Amount (৳)
                      </label>
                      <input
                        type="number"
                        value={orderSettings.maxOrderAmount}
                        onChange={(e) =>
                          setOrderSettings({
                            ...orderSettings,
                            maxOrderAmount: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimated Delivery Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={orderSettings.estimatedDeliveryTime}
                      onChange={(e) =>
                        setOrderSettings({
                          ...orderSettings,
                          estimatedDeliveryTime: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t mt-8">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiSave className="w-5 h-5" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
