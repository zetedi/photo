
import React from 'react';

const Hero: React.FC = () => {
    const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        document.querySelector('#contact')?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    
  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" 
      style={{ backgroundImage: "url('images/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 px-4">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-4">Creating Worlds Through Capturing Light</h1>
        <p className="text-lg md:text-xl text-brand-text-secondary mb-8 max-w-2xl mx-auto">Creative photography without limitations. It's your time and the place of your choice.</p>
        <a 
          href="#contact" 
          onClick={handleScrollToContact}
          className="bg-brand-primary text-brand-bg font-bold py-3 px-8 rounded-full hover:bg-brand-primary-hover transition-all duration-300 transform hover:scale-105"
        >
          Book a Session
        </a>
      </div>
    </section>
  );
};

export default Hero;
