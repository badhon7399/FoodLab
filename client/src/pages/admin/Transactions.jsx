import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiFilter,
  HiDownload,
  HiCheckCircle,
  HiX,
  HiClock,
  HiRefresh,
  HiEye,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
} from "react-icons/hi";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };

  // Confirm modal
  const [confirmState, setConfirmState] = useState({ open: false, id: null, message: "" });
  const openConfirm = (id, message) => setConfirmState({ open: true, id, message });
  const closeConfirm = () => setConfirmState({ open: false, id: null, message: "" });

  const statusColors = {
    Completed: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Refunded: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const statusIcons = {
    Completed: HiCheckCircle,
    Pending: HiClock,
    Failed: HiX,
    Refunded: HiRefresh,
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, methodFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/transactions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setTransactions(list);
      setFilteredTransactions(list);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setFilteredTransactions([]);
    }
  };

  const filterTransactions = () => {
    let filtered = Array.isArray(transactions) ? [...transactions] : [];

    if (statusFilter !== "All") {
      filtered = filtered.filter((txn) => txn?.status === statusFilter);
    }

    if (methodFilter !== "All") {
      filtered = filtered.filter((txn) => txn?.paymentMethod === methodFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn?.transactionId?.toLowerCase?.().includes(q) ||
          txn?.orderId?.toLowerCase?.().includes(q)
      );
    }

    setFilteredTransactions(filtered);
  };

  const refundTransaction = async (transactionId) => {
    openConfirm(transactionId, "Are you sure you want to refund this transaction?");
  };

  const confirmRefund = async () => {
    const transactionId = confirmState.id;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/transactions/${transactionId}/refund`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchTransactions();
      pushToast("Transaction refunded", "success");
    } catch (error) {
      console.error("Error refunding transaction:", error);
      pushToast("Failed to refund transaction", "error");
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transactions & Payments
          </h1>
          <p className="text-gray-500 mt-1">Monitor all payment transactions</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg">
          <HiDownload className="w-5 h-5" />
          <span>Export Transactions</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">৳45,230</h3>
            </div>
            <HiCheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Completed</p>
              <h3 className="text-3xl font-bold mt-2">1,234</h3>
            </div>
            <HiCheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <h3 className="text-3xl font-bold mt-2">23</h3>
            </div>
            <HiClock className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Failed</p>
              <h3 className="text-3xl font-bold mt-2">8</h3>
            </div>
            <HiX className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID or Order ID..."
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Methods</option>
            <option value="Bkash">Bkash</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Method
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
              {/* Sample Data - Replace with real data */}
              {[...Array(10)].map((_, index) => {
                const txn = {
                  _id: `txn_${index}`,
                  transactionId: `TXN${Math.random()
                    .toString(36)
                    .substr(2, 9)
                    .toUpperCase()}`,
                  orderId: `ORD${1000 + index}`,
                  customer: { name: "John Doe" },
                  amount: 450 + index * 50,
                  paymentMethod: index % 2 === 0 ? "Bkash" : "Cash on Delivery",
                  status: ["Completed", "Pending", "Failed", "Refunded"][
                    index % 4
                  ],
                  createdAt: new Date().toISOString(),
                };

                const StatusIcon = statusIcons[txn.status];

                return (
                  <motion.tr
                    key={txn._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {txn.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        #{txn.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{txn.customer.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        ৳{txn.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          txn.paymentMethod === "Bkash"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[txn.status]
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span>{txn.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(txn.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(txn);
                            setShowTransactionModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <HiEye className="w-5 h-5 text-gray-600" />
                        </button>
                        {txn.status === "Completed" && (
                          <button
                            onClick={() => refundTransaction(txn._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <HiRefresh className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showTransactionModal && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTransactionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Transaction Details</h2>
                    <p className="text-white/80 mt-1">
                      {selectedTransaction.transactionId}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="font-mono font-semibold text-gray-900">
                      {selectedTransaction.transactionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-gray-900">
                      #{selectedTransaction.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-2xl text-primary-500">
                      ৳{selectedTransaction.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedTransaction.paymentMethod === "Bkash"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[selectedTransaction.status]
                      }`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Transaction Date
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedTransaction.status === "Completed" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => refundTransaction(selectedTransaction._id)}
                      className="flex-1 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                    >
                      Issue Refund
                    </button>
                    <button className="flex-1 px-6 py-3 bg-primary-50 text-primary-600 rounded-xl font-semibold hover:bg-primary-100 transition-colors">
                      Download Receipt
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeConfirm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-start gap-3">
                <HiExclamation className="w-6 h-6 text-amber-600 mt-0.5" />
                <div className="text-gray-800">
                  <h3 className="text-lg font-semibold mb-1">Confirm refund</h3>
                  <p className="text-sm text-gray-600">{confirmState.message}</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRefund}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Refund
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-[min(360px,92vw)]">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
              className={`bg-white rounded-xl shadow-lg ring-1 overflow-hidden ${
                t.type === "success" ? "ring-green-200" : t.type === "error" ? "ring-red-200" : t.type === "warning" ? "ring-amber-200" : "ring-blue-200"
              }`}
            >
              <div className="relative">
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : t.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`}
                />
                <div className="p-3 pl-4 pr-10 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {t.type === "success" && <HiCheckCircle className="w-5 h-5 text-green-600" />}
                    {t.type === "error" && <HiXCircle className="w-5 h-5 text-red-600" />}
                    {t.type === "warning" && <HiExclamation className="w-5 h-5 text-amber-600" />}
                    {t.type === "info" && <HiInformationCircle className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="text-sm text-gray-800 leading-snug">{t.message}</div>
                  <button
                    className="absolute right-2 top-2 p-1 rounded-md hover:bg-gray-100 text-gray-500"
                    onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                    aria-label="Dismiss notification"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Transactions;
