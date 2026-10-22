import { Link } from '@/router';
import { Reveal } from './Reveal';

const NotFound = () => (
  <section className="grid min-h-svh place-content-center gap-8 px-gutter text-center">
    <Reveal>
      <p className="eyebrow">404 — Page not found</p>
      <h1 className="display mt-6 text-[clamp(3rem,9vw,6.5rem)]">
        Out of <em>frame</em>.
      </h1>
      <Link to="/" className="eyebrow link-line mt-10 inline-block pb-0.5 text-ink!">
        Return home
      </Link>
    </Reveal>
  </section>
);

export default NotFound;
