import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-y-auto h-full">
      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 border border-gray-200 rounded-full px-3 py-1 mb-6">
          Personal Progress Tracker
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Plan your day. Execute intentionally. See real progress.
        </h1>
        <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-xl">
          A system that connects daily planning with long-term goals and
          reflection.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/day-plans"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Start Planning <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Product screenshot placeholder */}
        <div className="mt-14 w-full max-w-2xl aspect-video rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-sm select-none">
          Product screenshot
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Productivity shouldn&apos;t feel scattered
        </h2>
        <p className="mt-4 text-gray-500 text-center leading-relaxed max-w-xl mx-auto">
          Most tools separate tasks, goals, and reflection into different apps.
          Progress becomes invisible when daily planning and long-term
          intentions are disconnected.
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          How it works
        </h2>
        <p className="mt-3 text-gray-500 text-center max-w-lg mx-auto">
          Three simple steps to turn intentions into visible progress.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Card step="1" title="Define quests">
            Create weekly goals, long-term goals, or daily challenges — each as
            a trackable quest.
          </Card>
          <Card step="2" title="Plan your day">
            Schedule time blocks in a simple daily plan and attach quests so
            every hour has intention.
          </Card>
          <Card step="3" title="Complete and reflect">
            Check off completed blocks and write a short daily reflection to
            close the loop.
          </Card>
        </div>
      </section>

      {/* ── Screenshots ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          See it in action
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <ScreenPlaceholder label="Dashboard" />
          <ScreenPlaceholder label="Day Plan" />
          <ScreenPlaceholder label="Quest Progress" />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Start building intentional days.
        </h2>
        <p className="mt-3 text-gray-500">
          It only takes a minute to get started.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Create your account <span aria-hidden>→</span>
        </Link>
      </section>
    </main>
  );
}

/* ── Sub-components ── */

function Card({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center">
        {step}
      </span>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 aspect-[4/3] flex items-center justify-center text-gray-300 text-sm select-none">
      {label}
    </div>
  );
}
