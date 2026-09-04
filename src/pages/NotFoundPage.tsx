import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link to="/" className="mt-4 inline-block text-sm text-pitch-700 underline">
        Back home
      </Link>
    </section>
  );
}
