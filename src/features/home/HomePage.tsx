import Hero from './components/Hero';
import LandingNav from './components/LandingNav';
import SiteFooter from './components/SiteFooter';

/**
 * Marketing / landing home screen. Standalone chrome (its own nav),
 * so it does not render inside `AppLayout` — see `src/router.tsx`.
 */
export default function HomePage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-paper text-ink">
      <LandingNav />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
}
