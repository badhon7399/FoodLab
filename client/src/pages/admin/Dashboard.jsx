import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiTrendingUp,
  HiTrendingDown,
  HiShoppingCart,
  HiUsers,
  HiCurrencyDollar,
  HiClock,
  HiCheckCircle,
  HiX,
  HiRefresh,
  HiDownload,
  HiEye,
  HiChevronRight,
  HiStar,
  HiTruck,
  HiCalendar,
  HiFilter,
  HiCreditCard,
} from "react-icons/hi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import api from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    periodRevenue: 0,
    periodOrders: 0,
    averageOrderValue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [hourlyPattern, setHourlyPattern] = useState([]);

  useEffect(() => {
    // Check authentication and admin role
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [timeRange, isAuthenticated, user, navigate]);

  // Socket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Note: Socket implementation would go here if socket utility exists
    // For now, this is a placeholder
    return () => {
      // Cleanup
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes] = await Promise.all([
        api.get("/admin/stats", { params: { range: timeRange } }),
        api.get("/admin/sales-data", { params: { range: timeRange } }),
      ]);

      // Backend returns: { success: true, stats: {...}, recentOrders: [...], topProducts: [...] }
      setStats(statsRes.data.stats || {});
      setRecentOrders(statsRes.data.recentOrders || []);
      setTopProducts(statsRes.data.topProducts || []);

      // Backend returns: { success: true, dailySales: [...], categorySales: [...], hourlyPattern: [...] }
      setSalesData(salesRes.data.dailySales || []);
      setCategorySales(salesRes.data.categorySales || []);
      setHourlyPattern(salesRes.data.hourlyPattern || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        navigate("/login");
      } else if (error.response?.status === 403) {
        // Forbidden - not admin
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Colors for charts
  const COLORS = [
    "#f97316",
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  // Format currency
  const formatCurrency = (value) => `৳${value?.toLocaleString() || 0}`;

  // Format number with suffix
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Stat cards configuration
  const statCards = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+12.5%",
      isPositive: true,
      icon: HiCurrencyDollar,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      subtext: `৳${stats.periodRevenue?.toLocaleString() || 0} this period`,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+8.2%",
      isPositive: true,
      icon: HiShoppingCart,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      subtext: `${stats.periodOrders || 0} new orders`,
    },
    {
      id: "customers",
      title: "Total Customers",
      value: stats.totalUsers,
      change: "+23.5%",
      isPositive: true,
      icon: HiUsers,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      subtext: "156 new this month",
    },
    {
      id: "pending",
      title: "Pending Orders",
      value: stats.pendingOrders,
      change: "-5.4%",
      isPositive: false,
      icon: HiClock,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
      subtext: "Needs attention",
    },
  ];

  // Status colors
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Preparing: "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiRefresh className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
            <HiDownload className="w-5 h-5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center text-sm font-semibold ${
                        stat.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.isPositive ? (
                        <HiTrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <HiTrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 border-t pt-3">
                {stat.subtext}
              </p>
            </div>
            {/* Gradient bottom border */}
            <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/orders"
            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all"
          >
            <div className="bg-white/20 p-3 rounded-lg">
              <HiShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Out for Delivery"
            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all"
          >
            <div className="bg-white/20 p-3 rounded-lg">
              <HiTruck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Out for Delivery</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </Link>

          <Link
            to="/admin/menu"
            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all"
          >
            <div className="bg-white/20 p-3 rounded-lg">
              <HiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Available Items</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl">
            <div className="bg-white/20 p-3 rounded-lg">
              <HiCurrencyDollar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Today's Revenue</p>
              <p className="text-2xl font-bold">
                ৳{stats.todayRevenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Daily revenue and order trends
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-semibold text-sm">
                Revenue
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-semibold text-sm">
                Orders
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="_id"
                stroke="#888"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis stroke="#888" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                formatter={(value, name) => [
                  name === "revenue" ? `৳${value}` : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorOrders)"
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales - Takes 1 column */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Sales by Category
            </h2>
            <p className="text-sm text-gray-500 mt-1">Revenue distribution</p>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) =>
                  `${_id} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categorySales.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `৳${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            {categorySales.slice(0, 5).map((category, index) => (
              <div
                key={category._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{category._id}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  ৳{category.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Pattern & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Order Pattern */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order Pattern</h2>
            <p className="text-sm text-gray-500 mt-1">Orders by hour of day</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="_id"
                stroke="#888"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis stroke="#888" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelFormatter={(value) => `${value}:00`}
              />
              <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Peak Hours Info */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <HiTrendingUp className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-900">Peak Hours</span>
            </div>
            <p className="text-sm text-orange-800">
              Most orders between{" "}
              <span className="font-bold">12 PM - 2 PM</span> and{" "}
              <span className="font-bold">7 PM - 9 PM</span>
            </p>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
              <p className="text-sm text-gray-500 mt-1">Best selling items</p>
            </div>
            <Link
              to="/admin/menu"
              className="text-primary-500 font-semibold text-sm hover:text-primary-600 flex items-center space-x-1"
            >
              <span>View All</span>
              <HiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {product.quantity} sold
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ৳{product.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end text-green-600 text-sm">
                    <HiTrendingUp className="w-4 h-4" />
                    <span className="font-semibold">+{12 + index}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest customer orders
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-primary-500 font-semibold text-sm hover:text-primary-600 flex items-center space-x-1"
            >
              <span>View All</span>
              <HiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.slice(0, 8).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{order._id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.deliveryDetails?.hall}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">
                        {order.items?.length} items
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">
                        ৳{order.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <HiEye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentOrders.length === 0 && (
              <div className="text-center py-12">
                <HiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats - Takes 1 column */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <HiCalendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Today's Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-blue-100">Revenue</span>
                <span className="text-2xl font-bold">
                  ৳{stats.todayRevenue?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-blue-100">Orders</span>
                <span className="text-2xl font-bold">
                  {stats.periodOrders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Avg Order</span>
                <span className="text-2xl font-bold">
                  ৳{Math.round(stats.averageOrderValue) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Customer Satisfaction
              </h3>
              <p className="text-sm text-gray-500">Based on reviews</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar
                    key={star}
                    className="w-6 h-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Based on 1,234 reviews</p>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-3">
                    {rating}
                  </span>
                  <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${
                          rating === 5
                            ? 85
                            : rating === 4
                            ? 60
                            : rating === 3
                            ? 30
                            : rating === 2
                            ? 10
                            : 5
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {rating === 5
                      ? "85%"
                      : rating === 4
                      ? "60%"
                      : rating === 3
                      ? "30%"
                      : rating === 2
                      ? "10%"
                      : "5%"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Payment Methods
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-500 p-2 rounded-lg">
                    <HiCreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">Bkash</span>
                </div>
                <span className="font-bold text-gray-900">68%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <HiCurrencyDollar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">Cash</span>
                </div>
                <span className="font-bold text-gray-900">32%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Delivery Time */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Delivery Time</p>
              <h3 className="text-3xl font-bold text-gray-900">28 min</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <HiClock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <HiTrendingDown className="w-4 h-4 mr-1" />
            <span className="font-semibold">-2 min faster</span>
          </div>
        </div>

        {/* Order Success Rate */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <h3 className="text-3xl font-bold text-gray-900">96.8%</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <HiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <HiTrendingUp className="w-4 h-4 mr-1" />
            <span className="font-semibold">+1.2% increase</span>
          </div>
        </div>

        {/* Customer Retention */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
              <h3 className="text-3xl font-bold text-gray-900">78%</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <HiUsers className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <HiTrendingUp className="w-4 h-4 mr-1" />
            <span className="font-semibold">+5% this month</span>
          </div>
        </div>
      </div>

      {/* System Alerts & Notifications */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
            <HiClock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">
                {stats.pendingOrders} orders pending approval
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please review and approve pending orders
              </p>
            </div>
            <Link
              to="/admin/orders?status=Pending"
              className="ml-auto px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
            >
              Review Now
            </Link>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl">
            <HiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">
                All systems operational
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Payment gateway and delivery tracking active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
