import { Link } from "react-router-dom";

export default function NotFoundStranica() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-600/75 to-orange-800/70 flex items-center justify-center">
      <div className="bg-white/30 backdrop-blur-lg border border-slate-500 shadow-xl rounded-2xl px-10 py-14 text-center max-w-lg w-full">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Страница није пронађена</h2>
        <p className="text-gray-600 mb-6">
          Страница коју тражите не постоји или је премештена.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-700/70 text-white px-6 py-2 rounded-xl hover:bg-blue-700/90 transition"
        >
          Назад на почетну
        </Link>
      </div>
    </main>
  );
}
