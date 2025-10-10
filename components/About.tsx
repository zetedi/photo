
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3">
            <img 
              src="images/zoltan.jpg" 
              alt="Photographer headshot" 
              className="rounded-full shadow-2xl mx-auto w-64 h-64 md:w-full md:h-auto object-cover"
            />
          </div>
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-4xl font-serif font-bold text-white mb-6">About Me</h2>
            <p className="text-brand-text-secondary leading-relaxed mb-4">
              Hello! I'm Zoltan Etedi.
            </p>
            <p className="text-brand-text-secondary leading-relaxed mb-4">
              My intention is to capture pearls of moments of creation, of joy, flow, inspiration, devotion, reconnection with nature and the divine essence, seeding light into matter.
            </p>
            <p className="text-brand-text-secondary leading-relaxed">
              I'd like to help you create your new world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
