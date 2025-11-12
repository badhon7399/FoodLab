import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiFilter,
  HiDownload,
  HiEye,
  HiCheck,
  HiX,
  HiClock,
  HiTruck,
} from "react-icons/hi";
import axios from "axios";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Preparing: "bg-blue-100 text-blue-700 border-blue-200",
    "Out for Delivery": "bg-purple-100 text-purple-700 border-purple-200",
    Delivered: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const statusIcons = {
    Pending: HiClock,
    Preparing: HiClock,
    "Out for Delivery": HiTruck,
    Delivered: HiCheck,
    Cancelled: HiX,
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setOrders(list);
      setFilteredOrders(list);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const filterOrders = () => {
    let filtered = Array.isArray(orders) ? [...orders] : [];

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order?.status === statusFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const idMatch = order?._id?.toLowerCase?.().includes(q);
        const nameMatch = order?.user?.name?.toLowerCase?.().includes(q);
        return idMatch || nameMatch;
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchOrders();
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <HiDownload className="w-5 h-5" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
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

        {/* Status Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {["All", "Pending", "Preparing", "Out for Delivery", "Delivered"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  statusFilter === status
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-2xl font-bold text-gray-900">
                  {status === "All"
                    ? orders.length
                    : orders.filter((o) => o.status === status).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">{status}</p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.user?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.deliveryDetails?.hall}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {order.items?.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        ৳{order.totalAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentStatus === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[order.status]
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="text-primary-500 hover:text-primary-600 font-semibold"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-white/80 mt-1">
                      Order #{selectedOrder._id.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.deliveryDetails?.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hall/Department</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.deliveryDetails?.hall}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Time</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.deliveryDetails?.instructions && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm">
                        Special Instructions
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.deliveryDetails.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.food?.image}
                            alt={item.food?.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {item.food?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>৳{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>৳0</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>৳{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedOrder.paymentStatus === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">
                    Update Order Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Pending",
                      "Preparing",
                      "Out for Delivery",
                      "Delivered",
                      "Cancelled",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, status)
                        }
                        className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                          selectedOrder.status === status
                            ? "border-primary-500 bg-primary-50 text-primary-600"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
