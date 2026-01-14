import { useState } from "react";
import { Mail } from "lucide-react";
import axios, { isAxiosError } from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "") + "public";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Sva polja su obavezna.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post<{ success: boolean; message: string }>(
        `${API_URL}/contact`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(res.data.message || "Greška pri slanju poruke.");
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Greška pri slanju poruke.");
      } else {
        setError("Greška pri slanju poruke.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
        Kontakt
      </h1>
      <p className="mt-3 text-gray-200 text-sm sm:text-base">
        Imaš pitanje, predlog ili želiš da prilagodiš FitTrack svom studiju?
        Pošalji poruku putem forme ili direktno na email.
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
        <Mail className="h-4 w-4 text-yellow-400" />
        <a
          href="mailto:fittrackappsupp@gmail.com"
          className="text-yellow-200 hover:text-yellow-400"
        >
          fittrackappsupp@gmail.com
        </a>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400">
            Ime i prezime
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400">
            Email
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400">
            Poruka
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-h-[120px]"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        {error && (
          <div className="text-sm text-rose-300 bg-rose-900/30 border border-rose-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {sent && (
          <div className="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-700 rounded-lg px-3 py-2">
            Poruka je poslata. Hvala na javljanju!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-60 transition"
        >
          {loading ? "Slanje..." : "Pošalji poruku"}
        </button>
      </form>
    </div>
  );
}