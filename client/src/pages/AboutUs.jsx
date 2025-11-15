import { motion } from "framer-motion";
import {
  HiHeart,
  HiLightningBolt,
  HiShieldCheck,
  HiStar,
  HiTrendingUp,
  HiUserGroup,
  HiAcademicCap,
  HiClock,
  HiCheckCircle,
  HiSparkles,
} from "react-icons/hi";

const AboutUs = () => {
  // Team members
  const team = [
    {
      name: "Sowkot Bhuiyan",
      role: "Founder & CEO",
      department: "CSE",
      image: "/team/ahmed.jpg",
      bio: "Passionate about bringing quality food to CUET students",
    },
    {
      name: "Afroza Khanom Sathi",
      role: "Head Chef",
      department: "",
      image: "/team/fatima.jpg",
      bio: "Creating delicious and hygienic meals",
    },
    {
      name: "Montasin Hossain Mahi",
      role: "Co-founder",
      department: "CSE",
      image: "/team/rahul.jpg",
      bio: "Ensuring smooth operations and timely delivery",
    }

  ];

  // Core values
  const values = [
    {
      icon: HiHeart,
      title: "Made with Love",
      description:
        "Every dish is prepared with care and passion for our fellow Cuetians",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
    },
    {
      icon: HiShieldCheck,
      title: "Hygiene First",
      description:
        "Maintaining the highest standards of cleanliness and food safety",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      icon: HiLightningBolt,
      title: "Fast Service",
      description: "Quick preparation and delivery to save your precious time",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: HiStar,
      title: "Quality Ingredients",
      description: "Using only fresh and premium quality ingredients",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: HiTrendingUp,
      title: "Growing Community",
      description: "Building a loyal following of satisfied customers",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: HiAcademicCap,
      title: "Student-Centric",
      description: "Tailored services for CUET students",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },

  ];

  // Statistics
  const stats = [
    { number: "5000+", label: "Happy Customers", icon: HiUserGroup },
    { number: "15000+", label: "Orders Delivered", icon: HiCheckCircle },
    { number: "4.8/5", label: "Average Rating", icon: HiStar },
    { number: "30 min", label: "Avg Delivery Time", icon: HiClock },
  ];

  // Journey timeline
  const timeline = [
    {
      year: "2024",
      title: "The Beginning",
      description:
        "Started with a small food cart serving basic snacks to students",
    },
    {
      year: "2024",
      title: "Expansion",
      description: "Expanded menu and introduced online ordering system",
    },
    {
      year: "2024",
      title: "Going Digital",
      description: "Launched mobile app and delivery service across all halls",
    },
    {
      year: "Future",
      title: "Vision Ahead",
      description:
        "Planning to open multiple outlets and introduce meal subscriptions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-primary-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About <span className="text-yellow-300">Food Lab</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Serving delicious, hygienic, and affordable food to the CUET
                community since 2024
              </p>
              <div className="flex items-center justify-center space-x-2 text-yellow-300">
                <HiSparkles className="w-6 h-6" />
                <span className="text-lg font-semibold">
                  Tasty • Healthy • Hygienic
                </span>
                <HiSparkles className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64 C240,100 480,100 720,64 C960,28 1200,28 1440,64 L1440,120 L0,120 Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Story
              </h2>
              <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Food Lab was born from a simple observation:{" "}
                  <strong>CUET students deserved better food options</strong>.
                  As students ourselves, we understood the struggle of finding
                  tasty, affordable, and hygienic meals on campus.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  What started as a small food cart in 2024 has grown into a
                  beloved campus institution. We began with just a few menu
                  items, but our commitment to{" "}
                  <strong>quality, hygiene, and customer satisfaction</strong>{" "}
                  quickly earned us a loyal following.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Today, Food Lab serves over{" "}
                  <strong>100 students daily</strong>, delivering everything
                  from quick snacks to full meals. We've embraced technology to
                  make ordering convenient, but we've never compromised on what
                  matters most: <strong>delicious food made with care</strong>.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our mission remains unchanged: to provide the CUET community
                  with food that's not just fuel, but a source of joy and
                  comfort during their academic journey. We're not just a food
                  service—we're part of the CUET family. 💙
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-lg w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-lg overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${value.color}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-r ${value.color}`}
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-primary-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a small cart to campus favorite
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-stretch md:items-center mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`flex-1 text-left ${
                    index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <span className="inline-block bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-500 rounded-full z-10" />
                  {index < timeline.length - 1 && (
                    <div className="absolute top-4 w-1 h-24 bg-primary-200 hidden md:block" />
                  )}
                </div>
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Food Lab
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col h-full w-full"
              >
                <div className="relative h-64 bg-gradient-to-br from-primary-500 to-primary-600 overflow-hidden">
                  {/* Placeholder for team member image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <HiAcademicCap className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{member.department}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Food Lab?
              </h2>
              <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Student-Focused",
                  description:
                    "Made by students, for students. We understand your needs and budget.",
                  icon: HiAcademicCap,
                },
                {
                  title: "Quality Assured",
                  description:
                    "Every ingredient is carefully selected and every dish is freshly prepared.",
                  icon: HiShieldCheck,
                },
                {
                  title: "Affordable Pricing",
                  description:
                    "Delicious food that doesn't break the bank. Student-friendly prices always.",
                  icon: HiTrendingUp,
                },
                {
                  title: "Fast Delivery",
                  description:
                    "Hot food delivered to your hall within 30 minutes. No more waiting!",
                  icon: HiLightningBolt,
                },
              ].map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl"
                >
                  <div className="bg-primary-100 p-4 rounded-xl flex-shrink-0">
                    <reason.icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Join the Food Lab Family
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Experience the difference of food made with passion and care
            </p>
            <a
              href="/menu"
              className="inline-block bg-white text-primary-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Order Now
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
