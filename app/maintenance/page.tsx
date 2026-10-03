export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red">
          GLAW Naturale
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          We’ll be back shortly.
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-gray-500 sm:text-base">
          Our website is temporarily unavailable while we make a few
          improvements. Please check back shortly.
        </p>
      </div>
    </main>
  );
}