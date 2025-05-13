import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FeatureButtonsProps {
  onFeatureClick: (feature: string) => void;
}

const FeatureButtons: React.FC<FeatureButtonsProps> = ({ onFeatureClick }) => {
  const features = [
    {
      name: 'Scan Website',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
      action: () => onFeatureClick('scan'),
      link: undefined
    },
    {
      name: 'Image Search',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      action: undefined,
      link: '/image-search'
    },
    {
      name: 'Account Check',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      action: () => onFeatureClick('account'),
      link: undefined
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {features.map((feature) => 
        feature.link ? (
          <Link href={feature.link} key={feature.name}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="feature-button"
            >
              {feature.icon}
              <span>{feature.name}</span>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            key={feature.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="feature-button"
            onClick={feature.action}
          >
            {feature.icon}
            <span>{feature.name}</span>
          </motion.div>
        )
      )}
    </div>
  );
};

export default FeatureButtons;