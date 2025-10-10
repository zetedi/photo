import React, { useEffect, useState } from 'react';

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const LightBox: React.FC<LightboxProps> = ({ src, alt, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in transition on mount
        setIsVisible(true);

        // Handle Escape key press to close the lightbox
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for the fade-out animation to finish before calling the parent's onClose
        setTimeout(onClose, 300); 
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the backdrop click from firing
        handleClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
            aria-label="Image viewer"
        >
            <button 
                onClick={handleClose} 
                className="absolute top-4 right-6 text-white text-5xl font-light hover:text-brand-primary transition-colors z-50"
                aria-label="Close image viewer"
            >
                &times;
            </button>
            {/* Clicks on the padding around the image won't close the modal */}
            <div className="relative p-4 w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                 <img
                    src={src}
                    alt={alt}
                    className={`block max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg shadow-2xl cursor-pointer transition-transform duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`}
                    onClick={handleImageClick}
                />
            </div>
        </div>
    );
};

export default LightBox;