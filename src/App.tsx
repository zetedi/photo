import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import Interlude from './components/Interlude';
import Portfolio from './components/Portfolio';

const App = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Interlude />
        <About />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
};

export default App;
