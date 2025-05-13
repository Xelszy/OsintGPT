import React from 'react';
import { motion } from 'framer-motion';

const AppPromo = () => {
  return (
    <motion.div 
      className="mt-8 bg-gray-900 rounded-md border border-white/10 p-3 flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div>
        <p className="text-sm text-gray-300">Introducing "OSINT GPT"</p>
        <p className="text-xs text-gray-500">The world in your hand</p>
      </div>
      <div className="w-8 h-8 text-red-500">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M0,0L9.5,1.15V11.5H0V0z M10.5,1.3L24,3V11.5H10.5V1.3z M0,12.5H9.5V22.85L0,24V12.5z M10.5,12.5H24V21L10.5,22.7V12.5z"/>
        </svg>
      </div>
    </motion.div>
  );
};

export default AppPromo;