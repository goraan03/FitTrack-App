import { Link } from "react-router-dom";

export default function NotFoundStranica() {
  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(800px_300px_at_50%_20%,rgba(253,224,71,0.08),transparent)]" />
      <div className="relative bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl px-10 py-14 text-center max-w-lg w-full">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block rounded-xl border border-yellow-400 text-yellow-700 px-6 py-2 font-semibold hover:bg-yellow-400/10 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}