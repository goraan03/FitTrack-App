import LegalLayout from "../../layouts/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      badge="Privacy & Data"
      title={
        <>
          PRIVACY <span className="text-amber-400">POLICY</span>
        </>
      }
      subtitle="This policy explains what information we collect, why we collect it, and how we protect it."
    >
      <Meta />

      <LegalSection title="1. Information We Collect">
        <p>
          We collect account information such as name, email address, and role (client, trainer, admin).
          Clients may also have profile details (e.g., age, gender, address) if provided.
        </p>
        <p className="mt-3">
          Trainers may manage training-related data such as sessions, programs, exercises, attendance,
          progress notes, and feedback/ratings associated with their clients.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To provide the service: scheduling, program delivery, progress tracking, and account access.</li>
          <li>To maintain security: authentication, access control, and audit logs (admin).</li>
          <li>To improve reliability and performance of the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>
          We do not sell personal data. Data is shared only:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>With service providers strictly required to operate the platform (e.g., hosting/email), when applicable.</li>
          <li>When required by law, regulation, or a valid legal request.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Data Retention">
        <p>
          We keep data only as long as necessary to provide the service and meet legal/operational obligations.
          You can request deletion of your account data where applicable.
        </p>
      </LegalSection>

      <LegalSection title="5. Security">
        <p>
          We use appropriate technical and organizational measures to protect data from unauthorized access,
          loss, or misuse. No system is 100% secure, but we continuously improve safeguards.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Rights">
        <p>
          Depending on your location, you may have rights to access, correct, export, or delete your personal data.
          Requests can be submitted via the contact page.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          For privacy questions or requests, contact us through the platform’s contact page.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

function Meta() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetaCard label="Policy Status" value="Active" />
      <MetaCard label="Last Updated" value="22.02.2026." />
      <MetaCard label="Applies To" value="All users" />
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0a0a0f] border border-[#27273a] rounded-2xl p-5 shadow-xl">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-300">{value}</div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic">
        {title}
      </h2>
      <div className="text-sm text-slate-400 leading-relaxed font-medium">{children}</div>
      <div className="pt-6 border-t border-[#27273a]" />
    </div>
  );
}