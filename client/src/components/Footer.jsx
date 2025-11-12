import { Link } from "react-router-dom";
import { HiLocationMarker, HiMail, HiPhone } from "react-icons/hi";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Food Lab</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Fresh, fast, and flavorful meals delivered from campus kitchens to your door.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-gray-900 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gray-900 transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/orders" className="hover:text-gray-900 transition-colors">Track Orders</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gray-900 transition-colors">My Account</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-900 transition-colors">Help Center</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 tracking-wide">Get in touch</h4>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <HiLocationMarker className="w-5 h-5 mt-0.5 text-gray-500" />
              <p>University Campus, Block A, Dhaka</p>
            </div>
            <a href="mailto:support@foodlab.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <HiMail className="w-5 h-5 text-gray-500" />
              support@foodlab.com
            </a>
            <a href="tel:+8801000000000" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <HiPhone className="w-5 h-5 text-gray-500" />
              +880 1000-000000
            </a>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Food Lab. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <span className="text-gray-300">|</span>
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
