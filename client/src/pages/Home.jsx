import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hero from "../components/Hero.jsx";
import FoodCard from "../components/FoodCard.jsx";
import api from "../utils/api";

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrival, setNewArrival] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [popularRes, featuredRes, newArrivalRes] = await Promise.all([
        api.get("/food/popular"),
        api.get("/food/featured"),
        api.get("/food/new-arrival"),
      ]);

      setPopular(popularRes.data.data || []);
      setFeatured(featuredRes.data.data || []);
      setNewArrival(newArrivalRes.data.data || []);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Popular",
      subtitle: "Most loved by our customers",
      data: popular,
      icon: "🔥",
    },
    {
      title: "Featured",
      subtitle: "Special selections for you",
      data: featured,
      icon: "⭐",
    },
    {
      title: "New Arrival",
      subtitle: "Freshly added to our menu",
      data: newArrival,
      icon: "🆕",
    },
  ];

  return (
    <div>
      <Hero />
      
      {sections.map((section, index) => (
        <section key={section.title} className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{section.icon}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {section.title}
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base ml-11">
              {section.subtitle}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : section.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm md:text-base">
                No {section.title.toLowerCase()} items available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {section.data.map((item) => (
                <FoodCard key={item._id} food={item} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
