import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiClock,
  HiChat,
  HiQuestionMarkCircle,
  HiCheckCircle,
  HiExclamation,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Contact information
  const contactInfo = [
    {
      icon: HiPhone,
      title: "Phone",
      details: ["+880 1712-345678", "+880 1912-345678"],
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      icon: HiMail,
      title: "Email",
      details: ["support@foodlab.cuet.ac.bd", "info@foodlab.cuet.ac.bd"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: HiLocationMarker,
      title: "Location",
      details: ["CUET Campus", "Chittagong, Bangladesh"],
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
    },
    {
      icon: HiClock,
      title: "Working Hours",
      details: ["Mon - Sat: 8:00 AM - 10:00 PM", "Sunday: 9:00 AM - 9:00 PM"],
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Social media
  const socialMedia = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      url: "https://facebook.com/foodlabcuet",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://instagram.com/foodlabcuet",
      color: "bg-pink-600",
      hoverColor: "hover:bg-pink-700",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: "https://twitter.com/foodlabcuet",
      color: "bg-blue-400",
      hoverColor: "hover:bg-blue-500",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      url: "https://wa.me/8801712345678",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
  ];

  // FAQs
  const faqs = [
    {
      question: "What are your delivery hours?",
      answer:
        "We deliver from 8:00 AM to 10:00 PM on weekdays, and 9:00 AM to 9:00 PM on Sundays.",
    },
    {
      question: "Do you deliver to all halls?",
      answer:
        "Yes! We deliver to all residential halls within the CUET campus.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Bkash, cash on delivery, and other mobile banking options.",
    },
    {
      question: "How can I cancel my order?",
      answer:
        "You can cancel your order within 5 minutes of placement through your orders page.",
    },
    {
      question: "Do you offer student discounts?",
      answer:
        "Yes! We frequently offer promo codes and special discounts for CUET students.",
    },
    {
      question: "Is the food hygienic?",
      answer:
        "Absolutely! Hygiene is our top priority. We maintain strict quality and cleanliness standards.",
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact`, formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                Get in Touch
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Have questions? We'd love to hear from you. Send us a message
                and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
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

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-32 relative z-10">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div
                  className={`${info.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}
                >
                  <info.icon
                    className={`w-8 h-8 bg-gradient-to-r ${info.color} bg-clip-text`}
                    style={{ WebkitTextFillColor: "transparent" }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {info.title}
                </h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 mb-1">
                    {detail}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <HiChat className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Send us a Message
                    </h2>
                    <p className="text-gray-500">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <HiCheckCircle className="w-6 h-6 text-green-500" />
                      <p className="text-green-800 font-medium">
                        Message sent successfully! We'll be in touch soon.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <HiExclamation className="w-6 h-6 text-red-500" />
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="partnership">
                        Partnership Opportunity
                      </option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <HiMail className="w-6 h-6" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Google Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.7567848392366!2d91.96878931495594!3d22.46158998523584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30ad2fca34ae5549%3A0x35c88a43e72e6724!2sChittagong%20University%20of%20Engineering%20%26%20Technology%20(CUET)!5e0!3m2!1sen!2sbd!4v1234567890123!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="CUET Location"
                />
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Follow Us
                </h3>
                <p className="text-gray-600 mb-6">
                  Stay connected with us on social media for updates, offers,
                  and more!
                </p>
                <div className="flex space-x-4">
                  {socialMedia.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} ${social.hoverColor} text-white p-4 rounded-xl transition-all hover:scale-110`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
                <p className="mb-6 text-white/90">
                  For urgent matters, you can reach us directly via phone or
                  WhatsApp
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+8801712345678"
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <HiPhone className="w-6 h-6" />
                    <span className="font-semibold">+880 1712-345678</span>
                  </a>
                  <a
                    href="https://wa.me/8801712345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                    <span className="font-semibold">Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Food Lab
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <HiQuestionMarkCircle className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="#contact-form"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">Operating Hours</h2>
              <p className="text-gray-300">We're here to serve you</p>
            </motion.div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { day: "Monday - Friday", hours: "8:00 AM - 10:00 PM" },
                  { day: "Saturday", hours: "8:00 AM - 10:00 PM" },
                  { day: "Sunday", hours: "9:00 AM - 9:00 PM" },
                  { day: "Public Holidays", hours: "Closed" },
                ].map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                  >
                    <span className="font-semibold">{schedule.day}</span>
                    <span className="text-yellow-300">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
