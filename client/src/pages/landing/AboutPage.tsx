export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
          O FitTrack aplikaciji
        </h1>
        <p className="mt-3 text-gray-200 max-w-3xl text-sm sm:text-base">
          FitTrack je web platforma namenjena personalnim trenerima, manjim
          studijima i online coaching‑u. Ideja je da ti olakša svakodnevni rad:
          zakazivanje termina, vođenje programa i komunikaciju sa klijentima –
          sve bez nepotrebne administracije.
        </p>
      </section>

      {/* ZA TRENERE I KLIJENTE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-yellow-300 mb-3">
            Za trenere
          </h2>
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed space-y-3">
            <span>
              FitTrack ti omogućava da na jednom mestu vodiš kompletnu
              evidenciju svog rada – od termina do programa za svakog klijenta.
              Jednostavno kreiraš i organizuješ trening termine, personalizovane
              programe i vežbe za svakog klijenta posebno, uz mogućnost dodavanja
              videa za svaku vežbu.
            </span>
            <br />
            <span>
              Klijenti nakon treninga mogu da ostave ocenu i utisak, pa uvek
              imaš jasnu sliku o njihovom napretku i kvalitetu svojih sesija.
              Cilj je da ti FitTrack skine administraciju s leđa, a da ti ostane
              više vremena i fokusa za sam trening i klijente.
            </span>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-300 mb-3">
            Za klijente
          </h2>
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed space-y-3">
            <span>
              Kao klijent dobijaš jasan pregled svih svojih programa i vežbi
              koje je trener pripremio za tebe, uz opis i video demonstracije.
              Direktno iz aplikacije možeš da zakazuješ termine na koje je tvoj
              trener označio da su slobodni.
            </span>
            <br />
            <span>
              Na jednom mestu pratiš kada treniraš, šta te očekuje na svakom
              treningu i kako napreduješ. Umesto da tražiš plan po porukama i
              slikama, u FitTrack‑u ti je sve centralizovano i uvek dostupno.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}