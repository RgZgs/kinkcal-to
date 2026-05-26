import Link from 'next/link';

export default function SubmitSuccessPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Event Submitted!</h1>
      <p className="text-zinc-400 mb-6">
        Thanks! Your event is being reviewed and will appear on the calendar shortly.
      </p>
      <Link href="/" className="btn-primary inline-block">
        ← Back to Calendar
      </Link>
    </main>
  );
}