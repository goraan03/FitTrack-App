import { useState } from "react";
import { Link } from "react-router-dom";
import { validacijaPodatakaAuth } from "../../api_services/validators/auth/AuthValidator";
import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { useAuth } from "../../hooks/auth/useAuthHook";

export function RegistracijaForma({ authApi }: AuthFormProps) {
  const [korisnickoIme, setKorisnickoIme] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [potvrda, setPotvrda] = useState("");
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [datumRodjenja, setDatumRodjenja] = useState("");
  const [pol, setPol] = useState<"musko" | "zensko" | "">("");
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const podnesiFormu = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    const validacija = validacijaPodatakaAuth(korisnickoIme, lozinka);
    if (!validacija.uspesno) {
      setGreska(validacija.poruka ?? "Неисправни подаци");
      return;
    }

    if (lozinka !== potvrda) {
      setGreska("Лозинке се не поклапају");
      return;
    }

    try {
      setLoading(true);
      const odgovor = await authApi.registracija({
        korisnickoIme,
        lozinka,
        ime,
        prezime,
        datumRodjenja,
        pol
      });
      if (odgovor.success && odgovor.data) {
        login(odgovor.data);
      } else {
        setGreska(odgovor.message || "Neuspešna регистрација");
      }
    } catch (err) {
      setGreska("Greška prilikom регистрације. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 shadow-xl rounded-2xl p-6 border">
      <form onSubmit={podnesiFormu} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ime */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
          <input value={ime} onChange={e => setIme(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {/* Prezime */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prezime</label>
          <input value={prezime} onChange={e => setPrezime(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {/* Datum rodjenja */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum rođenja</label>
          <input type="date" value={datumRodjenja} onChange={e => setDatumRodjenja(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {/* Pol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pol</label>
          <select value={pol} onChange={e => setPol(e.target.value as any)} required className="w-full border px-3 py-2 rounded-xl">
            <option value="">Izaberite</option>
            <option value="musko">Muško</option>
            <option value="zensko">Žensko</option>
          </select>
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={korisnickoIme} onChange={e => setKorisnickoIme(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {/* Lozinka */}
        <div>
          <label className="block mb-1 text-sm">Lozinka</label>
          <input type="password" value={lozinka} onChange={e => setLozinka(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {/* Potvrda */}
        <div>
          <label className="block mb-1 text-sm">Potvrda lozinke</label>
          <input type="password" value={potvrda} onChange={e => setPotvrda(e.target.value)} required className="w-full border px-3 py-2 rounded-xl" />
        </div>

        {greska && <div className="sm:col-span-2 text-red-600">{greska}</div>}

        <button type="submit" disabled={loading} className="sm:col-span-2 bg-indigo-600 text-white px-4 py-2 rounded-xl">
          {loading ? "Kreiranje..." : "Kreiraj nalog"}
        </button>

        <p className="sm:col-span-2 text-center text-sm">Već imate nalog? <Link to="/login" className="text-indigo-600">Prijava</Link></p>
      </form>
    </div>
  );
}