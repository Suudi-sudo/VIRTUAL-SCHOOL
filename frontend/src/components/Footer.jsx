import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import React from 'react';
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-5">
        {/* About Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Virtual School</h2>
          <p className="text-gray-400">
            Empowering educators and students through seamless online learning experiences.
          </p>
        </div>

        {/* Social Media Icons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaFacebookF /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaTwitter /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaInstagram /></a>
            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <p className="text-gray-400">📧 support@virtualschool.com</p>
          <p className="text-gray-400">📞 +123 456 7890</p>
          <p className="text-gray-400">📍 123 Learning Lane, Knowledge City</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-500 mt-10 border-t border-gray-700 pt-5">
        <p>&copy; {new Date().getFullYear()} Virtual School. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
