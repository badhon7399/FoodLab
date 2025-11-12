import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiTruck,
  HiLocationMarker,
  HiClock,
  HiCheckCircle,
  HiX,
  HiSearch,
  HiFilter,
} from "react-icons/hi";
import api from "../../utils/api.js";

const Delivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchTerm, statusFilter, deliveries]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/orders");
      if (data.success) {
        const orders = data.data || [];
        setDeliveries(orders);
        setFilteredDeliveries(orders);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    if (statusFilter !== "All") {
      filtered = filtered.filter((delivery) => delivery.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (delivery) =>
          delivery._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-500 mt-1">Track and manage order deliveries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Delivery List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Order #{order._id?.slice(-8)}</h3>
                <p className="text-sm text-gray-500">{order.user?.name}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[order.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <HiLocationMarker className="w-4 h-4" />
                <span>{order.deliveryDetails?.hall || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <HiTruck className="w-4 h-4" />
                <span>{order.items?.length || 0} items</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <HiClock className="w-4 h-4" />
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-lg font-bold text-primary-500">
                  ৳{order.totalAmount || order.total || 0}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDeliveries.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <HiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No deliveries found</p>
        </div>
      )}
    </div>
  );
};

export default Delivery;

