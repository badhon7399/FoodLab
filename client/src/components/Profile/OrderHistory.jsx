import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  HiShoppingBag,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiTruck,
  HiEye,
  HiDownload,
  HiFilter,
} from 'react-icons/hi';

const OrderHistory = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: HiClock,
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending',
      },
      processing: {
        icon: HiTruck,
        color: 'blue',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Processing',
      },
      completed: {
        icon: HiCheckCircle,
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Completed',
      },
      cancelled: {
        icon: HiXCircle,
        color: 'red',
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelled',
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <p className="text-gray-600 mt-1">
            You have {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <HiFilter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <HiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet"
              : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={() => setSelectedOrder(order)}
              getStatusConfig={getStatusConfig}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            getStatusConfig={getStatusConfig}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const OrderCard = ({ order, onViewDetails, getStatusConfig }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-500">
              Order #{order.orderNumber || order._id.slice(-6)}
            </span>
            <span
              className={`flex items-center gap-1 px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-sm font-semibold`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Items</p>
              <p className="font-semibold text-gray-900">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-semibold text-gray-900">
                ৳{order.total.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Delivery</p>
              <p className="font-semibold text-gray-900">{order.deliverySlot}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-semibold"
          >
            <HiEye className="w-5 h-5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const OrderDetailsModal = ({ order, onClose, getStatusConfig }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const downloadInvoice = () => {
    // Implement invoice download logic
    console.log('Downloading invoice for order:', order._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-500 mt-1">
              Order #{order.orderNumber || order._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiXCircle className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center gap-2 px-4 py-2 ${statusConfig.bg} ${statusConfig.text} rounded-full font-semibold`}
            >
              <StatusIcon className="w-5 h-5" />
              {statusConfig.label}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Delivery Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Hall</p>
                <p className="font-semibold text-gray-900">{order.hall}</p>
              </div>
              <div>
                <p className="text-gray-500">Room</p>
                <p className="font-semibold text-gray-900">{order.room}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Slot</p>
                <p className="font-semibold text-gray-900">
                  {order.deliverySlot}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{order.phone}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3">
                <p className="text-gray-500 text-sm">Notes</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 rounded-xl p-4"
                >
                  <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{item.name}</h5>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  ৳{(order.total - (order.deliveryFee || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  ৳{(order.deliveryFee || 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-primary-600">
                  ৳{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={downloadInvoice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <HiDownload className="w-5 h-5" />
              Download Invoice
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderHistory;