import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <main className="flex-grow flex items-center justify-center">
      <div className="text-center max-w-3xl px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Easy and secure access to your content .. fuck fuck fuck
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Store, share, and collaborate on files and folders from any mobile device, tablet, or computer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login" className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-1">
            Try Drive for Work
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white text-blue-600 border border-blue-200 text-lg font-semibold rounded-lg hover:bg-blue-50 shadow-md transition transform hover:-translate-y-1">
            Go to Drive
          </Link>
        </div>
        
        {/* Mock Graphic */}
        <div className="mt-16 p-4 bg-gray-100 rounded-t-2xl border-t border-x border-gray-200 shadow-2xl mx-auto w-full max-w-4xl h-64 overflow-hidden relative">
             <div className="flex space-x-2 mb-4">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-lg shadow-sm"></div>)}
             </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default LandingPage;