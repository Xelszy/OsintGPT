import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSearchResultsDisplayProps {
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

const ImageSearchResultsDisplay: React.FC<ImageSearchResultsDisplayProps> = ({ results }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if results are empty
  const isEmpty = !results || 
    (!results.images_results || results.images_results.length === 0) && 
    (!results.similar_images || results.similar_images.length === 0);

  if (isEmpty) {
    return (
      <div className="text-red-400 mt-3 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
        No images found for this search query.
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

  // Determine if this is a reverse image search result
  const isReverseSearch = Boolean(results.search_parameters?.url);
  
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 mt-4">
      {/* Header section with context */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          {isReverseSearch 
            ? '🔍 Reverse Image Search Results' 
            : `🖼️ Image Search Results for "${results.search_parameters?.q || ''}"`}
        </h3>
        
        {isReverseSearch && results.image_url && (
          <div className="flex items-center gap-3 mt-2 p-3 bg-slate-800/50 rounded-md">
            <img 
              src={results.image_url} 
              alt="Source image"
              className="w-20 h-20 object-cover rounded-md border border-slate-600/50"
              onError={handleImageError}
            />
            <div className="text-sm text-slate-300">
              <div className="mb-1">Source Image</div>
              <a 
                href={results.image_url}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 text-xs truncate block max-w-xs"
              >
                View original
              </a>
            </div>
          </div>
        )}
        
        {results.vision_text && (
          <div className="mt-3 text-sm text-slate-300 p-3 bg-slate-800/50 rounded-md">
            <div className="font-medium mb-1">AI Vision Analysis:</div>
            <p className="text-slate-400">{results.vision_text}</p>
          </div>
        )}
      </div>
      
      {/* Main results section */}
      {results.images_results && results.images_results.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base font-medium text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
            Found Images ({results.images_results.length})
          </h4>
          
          <div className="image-grid">
            {results.images_results.slice(0, 12).map((img, i) => (
              <motion.div
                key={i}
                className="image-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <img
                  src={img.thumbnail || img.original}
                  alt={img.title || 'Search result'}
                  onClick={() => handleImageClick(img.link || img.original || '')}
                  onError={handleImageError}
                  className="cursor-pointer"
                  loading="lazy"
                />
                {img.title && (
                  <div className="image-caption">
                    {img.title}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Similar images section */}
      {results.similar_images && results.similar_images.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base font-medium text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
            Similar Images ({results.similar_images.length})
          </h4>
          
          <div className="image-grid">
            {results.similar_images.slice(0, 6).map((img, i) => (
              <motion.div
                key={i}
                className="image-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <img
                  src={img.thumbnail || img.original}
                  alt={img.title || 'Similar image'}
                  onClick={() => handleImageClick(img.link || img.original || '')}
                  onError={handleImageError}
                  className="cursor-pointer"
                  loading="lazy"
                />
                {img.title && (
                  <div className="image-caption">
                    {img.title}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Source sites section */}
      {results.images_results && results.images_results.length > 0 && (
        <div className="mb-4">
          <h4 className="text-base font-medium text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
            Source Sites
          </h4>
          
          <div className="flex flex-col space-y-2">
            {results.images_results.slice(0, 5).map((result, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2 bg-slate-800/70 rounded-md"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {result.thumbnail && (
                  <img 
                    src={result.thumbnail} 
                    alt={result.title || 'Image source'} 
                    className="w-12 h-12 object-cover rounded-md border border-slate-700/50" 
                    onError={handleImageError}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {result.title || 'Unknown source'}
                  </div>
                  <a 
                    href={result.link || result.original} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                  >
                    {result.source || result.link || 'Unknown link'}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-slate-400 text-right mt-4">
        Results powered by Yandex Image Search
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

export default ImageSearchResultsDisplay; 