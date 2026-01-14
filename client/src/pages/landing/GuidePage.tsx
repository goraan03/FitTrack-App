export default function GuidePage() {
  return (
    <div className="space-y-10 text-sm sm:text-base text-gray-200">
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
          Uputstvo za korišćenje FitTrack aplikacije
        </h1>
        <p className="mt-3 max-w-3xl">
          Ovde je prikazan osnovni tok korišćenja aplikacije za trenere i
          klijente. Sekcije ispod možeš kasnije dopuniti screenshotovima iz
          aplikacije.
        </p>
      </header>

      {/* 1. Registracija i login */}
      <GuideSection
        title="1. Kreiranje naloga i prijava"
        text="Poseti stranicu za registraciju i izaberi da li se prijavljuješ kao trener ili klijent. Nakon registracije dobijaš mogućnost prijave putem email‑a i lozinke."
        steps={[
          {
            title: "Registracija trenera",
            text: "Popuni osnovne podatke: ime, prezime, email i lozinku. Nakon toga možeš odmah da kreiraš programe i dodaješ klijente.",
            img: "/images/guide/register-trainer.png",
          },
          {
            title: "Registracija klijenta",
            text: "Klijent se registruje i zatim dobija opciju da se poveže sa svojim trenerom.",
            img: "/images/guide/register-client.png",
          },
        ]}
      />

      {/* 2. Rad trenera */}
      <GuideSection
        title="2. Rad trenera – programi, termini i klijenti"
        text="Nakon prijave kao trener, u svom panelu ćeš videti sekcije za programe, termine i klijente."
        steps={[
          {
            title: "Kreiranje programa",
            text: "Na stranici za programe kreiraš nove programe, dodaješ vežbe, serije, ponavljanja i napomene.",
            img: "/images/guide/programs-list.png",
          },
          {
            title: "Zakazivanje termina",
            text: "U sekciji za termine podešavaš datum, trajanje, tip treninga i kapacitet. Klijenti vide ove termine i mogu da se prijave.",
            img: "/images/guide/training-terms.png",
          },
          {
            title: "Pregled klijenata",
            text: "Na listi klijenata vidiš dodeljene programe, istoriju treninga i ocene koje su ostavili.",
            img: "/images/guide/clients.png",
          },
        ]}
      />

      {/* 3. Rad klijenta */}
      <GuideSection
        title="3. Rad klijenta – prijava na termine i praćenje programa"
        text="Klijent kroz svoj nalog vidi šta je trener pripremio i lako upravlja terminima."
        steps={[
          {
            title: "Pregled dostupnih termina",
            text: "Na rasporedu klijent vidi sve slobodne termine svog trenera i može da se prijavi ili otkaže.",
            img: "/images/guide/client-schedule.png",
          },
          {
            title: "Pregled programa i vežbi",
            text: "U sekciji programa klijent vidi vežbe sa opisom, brojem serija, ponavljanja i eventualnim video snimcima.",
            img: "/images/guide/client-program.png",
          },
        ]}
      />

      {/* 4. Računi i naplata – kratak opis, bez admin detalja */}
      <GuideSection
        title="4. Računi i naplata (za trenere)"
        text="Platforma automatski broji broj aktivnih klijenata po treneru i jednom mesečno šalje račun na tvoj email, kako bi naplata korišćenja softvera bila što jednostavnija."
        steps={[
          {
            title: "Pregled računa (admin)",
            text: "U posebnom admin delu (koji koriste samo vlasnici sistema) vodi se evidencija svih računa. Trener dobija PDF sa jasnim iznosom i podacima za uplatu.",
            img: "/images/guide/admin-invoices.png",
          },
        ]}
      />
    </div>
  );
}

interface Step {
  title: string;
  text: string;
  img: string;
}

function GuideSection(props: { title: string; text: string; steps: Step[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-yellow-300">
        {props.title}
      </h2>
      <p>{props.text}</p>
      <div className="space-y-4">
        {props.steps.map((s, idx) => (
          <GuideStep key={idx} {...s} />
        ))}
      </div>
    </section>
  );
}

function GuideStep({ title, text, img }: Step) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div className="space-y-2">
        <p className="font-semibold text-yellow-200">{title}</p>
        <p className="text-gray-300 text-xs sm:text-sm">{text}</p>
      </div>
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-black/60">
        {/* ovde ćeš kasnije ubaciti realne screenshotove */}
        <img src={img} alt={title} className="w-full object-cover" />
      </div>
    </div>
  );
}