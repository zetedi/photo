
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <About />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default App;
