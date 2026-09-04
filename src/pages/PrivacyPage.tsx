export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Privacy Policy</h1>
        <p className="text-sm text-slate-500">
          Last updated {new Date().getFullYear()}
        </p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          kickr respects your privacy. This page explains what we collect, why we
          collect it, and the choices you have.
        </p>

        <div>
          <h2 className="mb-1 text-base font-semibold text-ink">
            Information we collect
          </h2>
          <p>
            Account details you provide (name, email, profile photo) and match
            activity you generate while using the app.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-ink">
            How we use it
          </h2>
          <p>
            To match you with nearby pickup games, keep teamsheets accurate, and
            improve the service. We do not sell your personal data.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-ink">Your choices</h2>
          <p>
            You can review or delete your account data at any time from your
            profile, or by contacting us at privacy@kickr.app.
          </p>
        </div>
      </div>
    </section>
  );
}
