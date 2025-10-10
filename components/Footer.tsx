
import React from 'react';
import { InstagramIcon } from './icons/InstagramIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { FacebookIcon } from './icons/FacebookIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-bg border-t border-gray-800 py-8">
      <div className="container mx-auto px-6 text-center text-brand-text-secondary">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-brand-primary transition-colors duration-300">
            <TwitterIcon className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-brand-primary transition-colors duration-300">
            <InstagramIcon className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-brand-primary transition-colors duration-300">
            <FacebookIcon className="w-6 h-6" />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} The Divine Story. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
