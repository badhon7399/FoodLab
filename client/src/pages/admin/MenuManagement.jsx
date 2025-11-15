import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiSearch,
  HiX,
  HiUpload,
  HiCheckCircle,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
} from "react-icons/hi";
import api from "../../utils/api";

const MenuManagement = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pizza",
    image: "",
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    isNewArrival: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  // Confirm modal
  const [confirmState, setConfirmState] = useState({ open: false, id: null, message: "" });
  const openConfirm = (id, message) => setConfirmState({ open: true, id, message });
  const closeConfirm = () => setConfirmState({ open: false, id: null, message: "" });

  const categories = [
    "All",
    "Pizza",
    "Burger",
    "Shawarma",
    "Momo",
    "Chicken Fry",
    "Dessert",
    "Drinks",
  ];

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [searchTerm, categoryFilter, foods]);

  const fetchFoods = async () => {
    try {
      const { data } = await api.get("/admin/food");
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setFoods(list);
      setFilteredFoods(list);
    } catch (error) {
      console.error("Error fetching foods:", error);
      setFoods([]);
      setFilteredFoods([]);
    }
  };

  const filterFoods = () => {
    let filtered = Array.isArray(foods) ? [...foods] : [];

    if (categoryFilter !== "All") {
      filtered = filtered.filter((food) => food?.category === categoryFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((food) => food?.name?.toLowerCase?.().includes(q));
    }

    setFilteredFoods(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hasMultiple = imagesFiles.length > 0;
      const isMultipart = hasMultiple || !!imageFile;
      let payload;

      if (isMultipart) {
        payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("category", formData.category);
        payload.append("isAvailable", String(formData.isAvailable));
        payload.append("isFeatured", String(formData.isFeatured));
        payload.append("isPopular", String(formData.isPopular));
        payload.append("isNewArrival", String(formData.isNewArrival));

        if (hasMultiple) {
          imagesFiles.forEach((file) => payload.append("images", file));
          payload.append("primaryImageIndex", String(primaryImageIndex || 0));
        } else if (imageFile) {
          payload.append("image", imageFile);
        }
        // Do NOT set Content-Type manually; let Axios/browser set the boundary.
      } else {
        payload = { ...formData };
      }

      if (editingFood) {
        await api.put(`/admin/food/${editingFood._id}`, payload);
        pushToast("Item updated successfully", "success");
      } else {
        await api.post("/admin/food", payload);
        pushToast("Item added successfully", "success");
      }

      fetchFoods();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving food:", error);
      if (error?.response) {
        console.error("Server response:", error.response.data);
        pushToast(error.response.data?.message || "Failed to save item", "error");
      } else {
        pushToast("Failed to save item", "error");
      }
    }
  };

  const handleDelete = async (foodId) => {
    openConfirm(foodId, "Are you sure you want to delete this item? This action cannot be undone.");
  };

  const confirmDelete = async () => {
    const id = confirmState.id;
    try {
      await api.delete(`/admin/food/${id}`);
      fetchFoods();
      pushToast("Item deleted", "success");
    } catch (error) {
      console.error("Error deleting food:", error);
      pushToast("Failed to delete item", "error");
    } finally {
      closeConfirm();
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      isAvailable: food.isAvailable ?? true,
      isFeatured: food.isFeatured ?? false,
      isPopular: food.isPopular ?? false,
      isNewArrival: food.isNewArrival ?? false,
    });
    setImageFile(null);
    setImagePreview(food.image || "");
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Pizza",
      image: "",
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      isNewArrival: false,
    });
    setImageFile(null);
    setImagePreview("");
    setImagesFiles([]);
    setImagesPreview([]);
    setPrimaryImageIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove menu items</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFoods.map((food) => (
          <motion.div
            key={food._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                {food.isPopular && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔥 Popular
                  </span>
                )}
                {food.isFeatured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ Featured
                  </span>
                )}
                {food.isNewArrival && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🆕 New
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    food.isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {food.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
                  {food.category}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {food.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {food.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-500">
                  ৳{food.price}
                </span>
                <span className="text-sm text-gray-500">
                  Rating: {food.rating || 0}⭐
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(food)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <HiPencil className="w-4 h-4" />
                  <span className="text-sm font-semibold">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(food._id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <HiTrash className="w-4 h-4" />
                  <span className="text-sm font-semibold">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFoods.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="text-gray-500 text-lg">No menu items found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingFood ? "Edit Menu Item" : "Add New Menu Item"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., Chicken Pizza"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="Delicious chicken pizza with fresh toppings..."
                  />
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Images (multiple upload) with primary selection and URL fallback */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImagesFiles(files);
                        setImagesPreview(files.map((f) => URL.createObjectURL(f)));
                        setPrimaryImageIndex(0);
                        // Keep legacy single states cleared when selecting multiple
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Or primary image URL</span>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  {/* Multiple previews with primary selection */}
                  {imagesPreview.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
                      {imagesPreview.map((src, idx) => (
                        <label key={idx} className={`relative rounded-xl overflow-hidden border-2 ${primaryImageIndex === idx ? 'border-primary-500' : 'border-transparent'}`}>
                          <img src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover" />
                          <input
                            type="radio"
                            name="primaryImage"
                            className="absolute top-2 left-2"
                            checked={primaryImageIndex === idx}
                            onChange={() => setPrimaryImageIndex(idx)}
                          />
                          {primaryImageIndex === idx && (
                            <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">Primary</span>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    (imagePreview || formData.image) && (
                      <img
                        src={imagePreview || formData.image}
                        alt="Preview"
                        className="mt-3 w-full h-48 object-cover rounded-xl"
                      />
                    )
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isAvailable: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Available for Order
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isFeatured: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ⭐ Featured
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPopular: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        🔥 Popular
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNewArrival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isNewArrival: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        🆕 New Arrival
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Select which sections this item should appear in on the homepage. You can select multiple categories.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {editingFood ? "Update Item" : "Add Item"}
                  </button>
                </div>
              </form>
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

export default MenuManagement;
