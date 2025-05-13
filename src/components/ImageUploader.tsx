import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelected: (imageData: { url: string; file?: File }) => void;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  isProcessing = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
    } catch (_) {
      return false;
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    if (!validateImageUrl(imageUrl)) {
      setError('Please enter a valid image URL (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    onImageSelected({ url: imageUrl });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    } else if (e.dataTransfer.items) {
      // Handle dropped URL
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'string') {
          e.dataTransfer.items[i].getAsString((url) => {
            if (validateImageUrl(url)) {
              setImageUrl(url);
              onImageSelected({ url });
            } else {
              setError('Invalid image URL. Please use a direct link to an image.');
            }
          });
          break;
        }
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    // Generate a local URL for the file
    const localImageUrl = URL.createObjectURL(file);
    setImageUrl(localImageUrl);
    
    // Pass both URL and file to parent
    onImageSelected({ url: localImageUrl, file });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-slate-800/70 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-200">
              {dragActive ? 'Drop your image here' : 'Upload an image for reverse search'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Drag and drop an image, or click to select from your device
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerFileInput}
            disabled={isProcessing}
            className="px-4 py-2 rounded-md bg-purple-600/30 hover:bg-purple-600/40 border border-purple-600/20 transition-colors text-white text-sm font-medium"
          >
            {isProcessing ? 'Processing...' : 'Select Image'}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-slate-200 text-sm font-medium mb-2">Or enter an image URL:</h4>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-slate-800/30 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            disabled={isProcessing}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 rounded-md bg-blue-600/30 hover:bg-blue-600/40 border border-blue-600/20 transition-colors text-white text-sm font-medium"
          >
            {isProcessing ? 'Processing...' : 'Search'}
          </motion.button>
        </form>
      </div>

      {error && (
        <div className="mt-3 text-red-400 text-sm p-2 rounded-md bg-red-900/20 border border-red-500/20">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 