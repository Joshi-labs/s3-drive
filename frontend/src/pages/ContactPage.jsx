import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

const ContactPage = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <div className="flex-grow container mx-auto px-4 py-12 max-w-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Sales</h2>
      <form className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="john@company.com" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-32" placeholder="How can we help?"></textarea>
        </div>
        <button type="button" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
            Send Message
        </button>
      </form>
    </div>
    <Footer />
  </div>
);

export default ContactPage;