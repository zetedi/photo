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
    <Interlude />
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
