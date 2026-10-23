import { useEffect, type ComponentType } from 'react';
import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import Interlude from './components/Interlude';
import NotFound from './components/NotFound';
import Portfolio from './components/Portfolio';
import { usePath } from './router';
import { pages, site } from './site';

const Home = () => (
  <>
    <Hero />
    {/* Stacked on small screens, the photographs need air between them; side by side they don't. */}
    <Interlude
      id="8"
      quote={
        <>
          “…seeding <span data-shine="light">light</span> <br />
          into matter…”
        </>
      }
      lens={{ rest: [0.26, 0.74], size: 0.1, magnification: 2.0 }}
      className="mt-12 lg:mt-0"
    />
    <Interlude
      id="6"
      quote={
        <>
          “…bringing wonders <br />
          into <span data-shine="sight">sight</span>.”
        </>
      }
      lens={{ rest: [0.5, 0.53], size: 0.17, magnification: 1.5 }}
      place="low-end"
      className="mt-12 lg:mt-gutter"
    />
  </>
);

const routes: Record<string, ComponentType> = {
  '/': Home,
  '/work': Portfolio,
  '/about': About,
  '/contact': ContactForm,
};

const HOME_TITLE = document.title;

const App = () => {
  const path = usePath();
  const Page = routes[path] ?? NotFound;

  useEffect(() => {
    const page = pages.find((p) => p.path === path);
    document.title = path === '/' ? HOME_TITLE : `${page?.title ?? 'Page not found'} — ${site.name}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${site.url}${path}`);
  }, [path]);

  return (
    <>
      <Header />
      <main key={path} className="min-h-svh">
        <Page />
      </main>
      <Footer />
    </>
  );
};

export default App;
