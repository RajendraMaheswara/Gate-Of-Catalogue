export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-6 items-center max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Babylon
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          A circle and booth directory website for convention events, featuring a catalog of items and a personal pre-order tracker.
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/events"
            className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Explore Events
          </a>
          <a
            href="/my-list"
            className="rounded-full border border-neutral-300 dark:border-neutral-700 px-6 py-3 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            My PO Tracker
          </a>
        </div>
      </main>
    </div>
  );
}
