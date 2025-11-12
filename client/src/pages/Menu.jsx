import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "../components/FoodCard.jsx";
import { HiSearch, HiFilter } from "react-icons/hi";
import api from "../utils/api.js";

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "All",
    "Pizza",
    "Burger",
    "Shawarma",
    "Momo",
    "Dessert",
    "Drinks",
  ];

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [activeCategory, searchTerm, foods]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/food");
      // Handle backend response structure: { success: true, data: [...] }
      const items =
        data?.data || (Array.isArray(data) ? data : data.foods || []);
      setFoods(items);
      setFilteredFoods(items);
    } catch (e) {
      console.error("Failed to fetch foods:", e);
      setError(
        e.code === "ERR_NETWORK" || e.message?.includes("Network Error")
          ? "Cannot connect to server. Please make sure the backend is running."
          : "Failed to load menu items. Please try again later."
      );
      setFoods([]);
      setFilteredFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    if (activeCategory !== "All") {
      filtered = filtered.filter((food) => food.category === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (food) =>
          (food.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (food.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-heading font-bold text-dark mb-4">
            Our <span className="text-primary-500">Delicious</span> Menu
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our handcrafted dishes made with premium ingredients and
            lots of love ❤️
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for pizza, burger, shawarma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-bold text-dark">{filteredFoods.length}</span>{" "}
            items
          </p>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-500">
            <HiFilter className="w-5 h-5" />
            <span className="font-medium">More Filters</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading menu items...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-red-50 rounded-2xl border-2 border-red-200"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-700 mb-2">
              Connection Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFoods}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Food Grid */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredFoods.map((food) => (
                <FoodCard key={food._id || food.id} food={food} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !error && filteredFoods.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
