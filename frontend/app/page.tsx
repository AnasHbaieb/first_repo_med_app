import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <nav className="mb-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">Med CRM</div>
          <Link
            href="/auth/login"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Admin Login
          </Link>
        </nav>

        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm text-blue-200">
              Medical operations dashboard
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Manage students, groups, and attendance in one place.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              A clean, fast CRM for academic and medical training operations, built to keep your team organized and informed.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/login"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Open dashboard
              </Link>
              <Link
                href="/admin/dashboard"
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-100 transition hover:border-slate-500"
              >
                View admin area
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-blue-950/30">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Active students</p>
                <p className="mt-2 text-3xl font-bold">1,248</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">Groups</p>
                  <p className="mt-2 text-2xl font-bold">36</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">Attendance</p>
                  <p className="mt-2 text-2xl font-bold">96%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
