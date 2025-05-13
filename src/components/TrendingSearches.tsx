import React from 'react';
import { motion } from 'framer-motion';

const TrendingSearches: React.FC = () => {
  // Sample trending searches - these would come from an API in a real app
  const trendingSearches = [
    "US-China agree to 90-day tariff cut amid trade talks",
    "House Republicans propose cuts to clean energy and Medicaid",
    "Trump to accept $400 million jet gift from Qatar",
    "Samsung unveils ultra-thin Galaxy S25 Edge with 200MP camera",
    "Trump's Middle East tour includes Qatar and UAE excludes Israel",
    "Apple iOS 18.5 adds satellite support for iPhone 13",
    "McDonald's to hire 375,000 US workers this summer",
    "Apple unveils AI battery management for iOS 19"
  ];

  return (
    <motion.div
      className="w-full max-w-2xl mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="space-y-2">
        {trendingSearches.map((search, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 * (index + 1) }}
          >
            <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-[#222222] transition-colors text-gray-400 hover:text-white flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingSearches;