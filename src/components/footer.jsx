import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 py-8 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-4">
          
          {/* Logo & Description */}
          <h1 className="text-2xl font-bold text-purple-500 mb-1">MoviePie</h1>
          <p className="text-sm text-gray-400 max-w-xs">
            Explore, binge, and get personalized movie and series recommendations.
          </p>
          <p className="text-gray-500 text-xs italic">Your cinematic journey starts here 🎬</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-6"></div>

        {/* Copyright */}
        <p className="text-center text-gray-500 text-sm mt-4">
          &copy; {new Date().getFullYear()} MoviePie. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;