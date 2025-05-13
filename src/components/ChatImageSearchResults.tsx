import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatImageSearchResultsProps {
  results: {
    images_results?: Array<{
      thumbnail?: string;
      original?: string;
      link?: string;
      title?: string;
      source?: string;
    }>;
    similar_images?: Array<{
      thumbnail?: string;
      original?: string;
      link?: string;
      title?: string;
    }>;
    search_parameters?: {
      engine?: string;
      url?: string;
      q?: string;
    };
    vision_text?: string;
    success?: boolean;
    image_url?: string;
  };
}

const ChatImageSearchResults: React.FC<ChatImageSearchResultsProps> = ({ results }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Determine if this is a reverse image search result
  const isReverseSearch = Boolean(results.search_parameters?.url || results.image_url);
  const query = results.search_parameters?.q || '';
  
  // Get combined results from both regular and similar images
  const mainResults = results.images_results || [];
  const similarResults = results.similar_images || [];
  const allResults = [...mainResults, ...similarResults];
  
  // Get display count based on showAll state
  const displayCount = showAll ? 12 : 4;
  
  // Handle case with no results
  if (!allResults.length) {
    return (
      <div className="text-red-400 mt-2 p-2 rounded-lg bg-red-900/20 border border-red-500/20 text-sm">
        {isReverseSearch 
          ? "No similar images found. Try using a different image or one with better resolution."
          : `No images found for "${query}". Try using different search terms.`
        }
      </div>
    );
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-image.png';
    e.currentTarget.onerror = null;
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <div className="py-2">
      {/* Header with search type and query */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-slate-200 mb-2 flex items-center">
          {isReverseSearch ? (
            <>
              <span className="mr-1">🔍</span> 
              <span>Reverse Image Search Results</span>
            </>
          ) : (
            <>
              <span className="mr-1">🖼️</span>
              <span>Image Search Results for "{query}"</span>
            </>
          )}
        </h4>
        
        {/* Show source image for reverse searches */}
        {isReverseSearch && results.image_url && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-slate-800/50 rounded-md">
            <img 
              src={results.image_url} 
              alt="Source"
              className="w-14 h-14 object-cover rounded-md border border-slate-600/50"
              onError={handleImageError}
            />
            <div className="text-xs text-slate-300">
              <div className="mb-1">Source Image</div>
              <a 
                href={results.image_url}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 text-xs truncate block"
              >
                View original
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Image grid */}
      <div className="chat-image-grid mb-3">
        {allResults.slice(0, displayCount).map((img, i) => (
          <motion.div
            key={i}
            className="chat-image-item"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <img
              src={img.thumbnail || img.original}
              alt={img.title || 'Image result'}
              onClick={() => handleImageClick(img.link || img.original || '')}
              onError={handleImageError}
              className="cursor-pointer"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
      
      {/* Show more/less toggle */}
      {allResults.length > 4 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center"
        >
          {showAll ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show less
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show more ({allResults.length - 4} more)
            </>
          )}
        </button>
      )}

      {/* Source footer */}
      <div className="text-xxs text-slate-400 mt-2">
        Powered by Yandex Image Search
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <button
                className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatImageSearchResults; 