import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiTrendingUp,
  HiTrendingDown,
  HiDownload,
  HiCalendar,
  HiShoppingCart,
  HiUsers,
  HiCurrencyDollar,
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

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growthRate: 0,
  });

  // Sample data - replace with real API data
  const revenueData = [
    { date: "2024-01-01", revenue: 4000, orders: 24, customers: 18 },
    { date: "2024-01-02", revenue: 3000, orders: 18, customers: 15 },
    { date: "2024-01-03", revenue: 5000, orders: 32, customers: 25 },
    { date: "2024-01-04", revenue: 2780, orders: 20, customers: 17 },
    { date: "2024-01-05", revenue: 6890, orders: 45, customers: 35 },
    { date: "2024-01-06", revenue: 8390, orders: 52, customers: 42 },
    { date: "2024-01-07", revenue: 7490, orders: 48, customers: 38 },
  ];

  const categoryPerformance = [
    { category: "Pizza", sales: 45000, orders: 320, growth: 12.5 },
    { category: "Burger", sales: 32000, orders: 280, growth: 8.3 },
    { category: "Shawarma", sales: 28000, orders: 250, growth: 15.7 },
    { category: "Momo", sales: 18000, orders: 180, growth: 5.2 },
    { category: "Dessert", sales: 15000, orders: 150, growth: -2.1 },
    { category: "Drinks", sales: 12000, orders: 200, growth: 3.8 },
  ];

  const hourlyData = [
    { hour: "8 AM", orders: 5 },
    { hour: "9 AM", orders: 12 },
    { hour: "10 AM", orders: 18 },
    { hour: "11 AM", orders: 25 },
    { hour: "12 PM", orders: 45 },
    { hour: "1 PM", orders: 52 },
    { hour: "2 PM", orders: 38 },
    { hour: "3 PM", orders: 28 },
    { hour: "4 PM", orders: 22 },
    { hour: "5 PM", orders: 35 },
    { hour: "6 PM", orders: 48 },
    { hour: "7 PM", orders: 55 },
    { hour: "8 PM", orders: 42 },
    { hour: "9 PM", orders: 30 },
  ];

  const topProducts = [
    { name: "Chicken Pizza", value: 35, color: "#f97316" },
    { name: "Beef Burger", value: 25, color: "#10b981" },
    { name: "Shawarma", value: 20, color: "#3b82f6" },
    { name: "Momo", value: 12, color: "#f59e0b" },
    { name: "Others", value: 8, color: "#8b5cf6" },
  ];

  const customerSatisfaction = [
    { subject: "Food Quality", value: 95, fullMark: 100 },
    { subject: "Delivery Speed", value: 88, fullMark: 100 },
    { subject: "Price", value: 82, fullMark: 100 },
    { subject: "Packaging", value: 90, fullMark: 100 },
    { subject: "Service", value: 92, fullMark: 100 },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/admin/analytics?range=${timeRange}`);
      // Handle both response formats: { success: true, data: {...} } or direct data
      if (data.data) {
        setAnalytics(data.data.summary || data.data);
      } else {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const exportReport = () => {
    // Implement CSV/PDF export
    alert("Exporting report...");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Comprehensive business insights and metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm md:text-base"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm md:text-base"
          >
            <HiDownload className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 md:p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Revenue
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">৳45,230</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <HiCurrencyDollar className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <HiTrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">+12.5% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 md:p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">1,234</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <HiShoppingCart className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <HiTrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">+8.2% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 md:p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Avg Order Value
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">৳367</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <HiCurrencyDollar className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <HiTrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">+4.1% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 md:p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                New Customers
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mt-2">156</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <HiUsers className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <HiTrendingDown className="w-5 h-5" />
            <span className="text-sm font-semibold">-2.3% vs last period</span>
          </div>
        </motion.div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Revenue & Orders Trend
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 md:px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-semibold text-xs md:text-sm">
              Revenue
            </button>
            <button className="px-3 md:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-semibold text-xs md:text-sm">
              Orders
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300} className="min-h-[250px] md:min-h-[300px]">
          <AreaChart data={revenueData}>
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
              dataKey="date" 
              stroke="#888" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#888" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance & Hourly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Category Performance
          </h2>
          <div className="space-y-4">
            {categoryPerformance.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm md:text-base">
                    {cat.category}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xs md:text-sm text-gray-600">
                      {cat.orders} orders
                    </span>
                    <span className="font-bold text-gray-900 text-sm md:text-base">
                      ৳{cat.sales.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs md:text-sm font-semibold ${
                        cat.growth >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {cat.growth >= 0 ? "+" : ""}
                      {cat.growth}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.sales / 45000) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Orders Pattern */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Hourly Order Pattern
          </h2>
          <ResponsiveContainer width="100%" height={300} className="min-h-[250px] md:min-h-[300px]">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#888" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#888" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Customer Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Top Selling Products
          </h2>
          <ResponsiveContainer width="100%" height={300} className="min-h-[250px] md:min-h-[300px]">
            <PieChart>
              <Pie
                data={topProducts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4 md:mt-6">
            {topProducts.map((product) => (
              <div key={product.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: product.color }}
                />
                <span className="text-xs md:text-sm text-gray-600 truncate">{product.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Satisfaction Radar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Customer Satisfaction
          </h2>
          <ResponsiveContainer width="100%" height={300} className="min-h-[250px] md:min-h-[300px]">
            <RadarChart data={customerSatisfaction}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" stroke="#888" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#888" />
              <Radar
                name="Satisfaction"
                dataKey="value"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 md:mt-6 text-center">
            <p className="text-2xl md:text-3xl font-bold text-gray-900">89.4%</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Overall Satisfaction Score
            </p>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <HiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Peak Hours</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Most orders are placed between{" "}
              <span className="font-bold text-blue-600">12 PM - 2 PM</span> and{" "}
              <span className="font-bold text-blue-600">6 PM - 8 PM</span>
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <HiShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Best Seller</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-bold text-green-600">Chicken Pizza</span> is
              the most ordered item with{" "}
              <span className="font-bold">320 orders</span> this period
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <HiUsers className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Customer Growth</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              You've gained{" "}
              <span className="font-bold text-purple-600">
                156 new customers
              </span>{" "}
              with a <span className="font-bold">78% retention rate</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
