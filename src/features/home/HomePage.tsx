import Hero from './components/Hero';
import LandingNav from './components/LandingNav';
import SiteFooter from './components/SiteFooter';

/**
 * Marketing / landing home screen. Standalone chrome (its own nav),
 * so it does not render inside `AppLayout` — see `src/router.tsx`.
 */
export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-y-auto bg-paper text-ink md:h-screen md:overflow-hidden">
      <LandingNav />
      <main className="flex-1 md:min-h-0 md:overflow-hidden">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
}
