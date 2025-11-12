import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiFilter,
  HiDotsVertical,
  HiEye,
  HiBan,
  HiCheckCircle,
  HiMail,
  HiPhone,
  HiCalendar,
  HiShoppingBag,
  HiX,
  HiUserAdd,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
} from "react-icons/hi";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setUsers(list);
      setFilteredUsers(list);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  const filterUsers = () => {
    let filtered = Array.isArray(users) ? [...users] : [];

    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user?.role === roleFilter);
    }

    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active";
      filtered = filtered.filter((user) => user?.isActive === isActive);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user?.name?.toLowerCase?.().includes(q) ||
          user?.email?.toLowerCase?.().includes(q) ||
          user?.phone?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchUsers();
      setShowActionMenu(null);
      pushToast(`User ${!currentStatus ? "activated" : "banned"}`, "success");
    } catch (error) {
      console.error("Error updating user status:", error);
      pushToast("Failed to update user status", "error");
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchUsers();
      setShowActionMenu(null);
      pushToast(`Role changed to ${newRole}`, "success");
    } catch (error) {
      console.error("Error updating user role:", error);
      pushToast("Failed to change role", "error");
    }
  };

  const deleteUser = async (userId) => {
    openConfirm(userId, "Are you sure you want to delete this user? This action cannot be undone.");
  };

  const confirmDelete = async () => {
    const userId = confirmState.id;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchUsers();
      setShowActionMenu(null);
      pushToast("User deleted", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      pushToast("Failed to delete user", "error");
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all registered users and permissions
          </p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg">
          <HiUserAdd className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <HiShoppingBag className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.filter((u) => u.isActive).length}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <HiCheckCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Admins</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.filter((u) => u.role === "admin").length}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <HiUserAdd className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Banned Users</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.filter((u) => !u.isActive).length}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <HiBan className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hall/Dept
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <HiMail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <HiPhone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{user.hall || "N/A"}</span>
                    {user.department && (
                      <p className="text-sm text-gray-500">{user.department}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <HiCheckCircle className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <HiBan className="w-4 h-4" />
                          <span>Banned</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <HiCalendar className="w-4 h-4" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <HiEye className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowActionMenu(
                              showActionMenu === user._id ? null : user._id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <HiDotsVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Action Menu */}
                        <AnimatePresence>
                          {showActionMenu === user._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10"
                            >
                              <button
                                onClick={() =>
                                  toggleUserStatus(user._id, user.isActive)
                                }
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
                              >
                                {user.isActive ? (
                                  <>
                                    <HiBan className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-700">
                                      Ban User
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <HiCheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-700">
                                      Activate User
                                    </span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  changeUserRole(
                                    user._id,
                                    user.role === "admin" ? "user" : "admin"
                                  )
                                }
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
                              >
                                <HiUserAdd className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-700">
                                  Make{" "}
                                  {user.role === "admin" ? "User" : "Admin"}
                                </span>
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center space-x-2"
                              >
                                <HiX className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">
                                  Delete User
                                </span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
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
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedUser.name}
                      </h2>
                      <p className="text-white/80">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hall</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.hall || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.department || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Role</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {selectedUser.role.charAt(0).toUpperCase() +
                        selectedUser.role.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedUser.isActive ? "Active" : "Banned"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Order Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-500">24</p>
                      <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        ৳4,580
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">2</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Active Orders
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      toggleUserStatus(selectedUser._id, selectedUser.isActive)
                    }
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                      selectedUser.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {selectedUser.isActive ? "Ban User" : "Activate User"}
                  </button>
                  <button
                    onClick={() =>
                      changeUserRole(
                        selectedUser._id,
                        selectedUser.role === "admin" ? "user" : "admin"
                      )
                    }
                    className="flex-1 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                  >
                    Make {selectedUser.role === "admin" ? "User" : "Admin"}
                  </button>
                </div>
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
                  <h3 className="text-lg font-semibold mb-1">Confirm deletion</h3>
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
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
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

export default UserManagement;
