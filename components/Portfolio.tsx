import React, { useState } from 'react';
import LightBox from './LightBox';

const images = [
  { id: 1, src: '/images/1.jpg', alt: '' },
  { id: 2, src: '/images/2.jpg', alt: '' },
  { id: 3, src: '/images/3.jpg', alt: '' },
  { id: 4, src: '/images/4.jpg', alt: '' },
  { id: 5, src: '/images/5.jpg', alt: '' },
  { id: 6, src: '/images/6.jpg', alt: '' },
  { id: 7, src: '/images/7.jpg', alt: '' },
  { id: 8, src: '/images/8.jpg', alt: '' },
];

const Portfolio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{src: string; alt: string} | null>(null);

  const handleImageClick = (image: {src: string; alt: string}) => {
    setSelectedImage(image);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };
  
  return (
    <section id="portfolio" className="py-20 bg-brand-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif font-bold text-center text-white mb-12">My Work</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="mb-4 break-inside-avoid" onClick={() => handleImageClick(image)}>
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-auto rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      {selectedImage && (
        <LightBox 
          src={selectedImage.src} 
          alt={selectedImage.alt} 
          onClose={handleCloseLightbox} 
        />
      )}
    </section>
  );
};

export default Portfolio;