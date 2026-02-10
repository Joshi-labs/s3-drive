import React from 'react';
import { Link } from 'react-router-dom';
import Icons from './icons';
import Logo from '../assets/logo.png';

const Header = () => (
  <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
    <div className="flex items-center space-x-2">
      <img src={Logo} alt="DriveClone Logo" className="h-8 w-8" />
      <span className="text-xl font-medium text-gray-700">S3 Drive</span>
    </div>
    <div className="hidden md:flex space-x-6">
      <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Product</Link>
      <Link to="/about" className="text-gray-600 hover:text-blue-600 transition">About</Link>
      <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>
    </div>
    <div className="flex space-x-3">
      <Link to="/login" className="px-5 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">Log in</Link>
      <Link to="/login" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md">Go to Drive</Link>
    </div>
  </header>
);

export default Header;