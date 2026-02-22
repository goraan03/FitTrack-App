import LegalLayout from "../../layouts/LegalLayout";

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      badge="Platform Rules"
      title={
        <>
          TERMS <span className="text-amber-400">OF SERVICE</span>
        </>
      }
      subtitle="These terms define how the platform can be used and what users can expect from the service."
    >
      <Meta />

      <LegalSection title="1. Agreement">
        <p>
          By accessing or using FitTrack, you agree to these Terms of Service and any applicable laws.
          If you do not agree, do not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts & Access">
        <ul className="list-disc pl-5 space-y-2">
          <li>Clients can self-register.</li>
          <li>Trainer accounts are created and managed by an administrator.</li>
          <li>You are responsible for maintaining the confidentiality of your credentials.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>Use the platform for unlawful activities.</li>
          <li>Attempt to access other accounts or restricted data.</li>
          <li>Upload malicious content or disrupt service availability.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Training Disclaimer">
        <p>
          FitTrack is a management platform. Training programs and coaching decisions are the responsibility
          of trainers and clients. Always follow professional guidance and prioritize safety.
        </p>
      </LegalSection>

      <LegalSection title="5. Availability">
        <p>
          We aim for reliable service, but availability can be affected by maintenance, updates, or technical issues.
          We may modify or discontinue features to improve the platform.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitation of Liability">
        <p>
          To the extent permitted by law, FitTrack is not liable for indirect damages or losses arising from
          the use of the platform, including business decisions or training outcomes.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to Terms">
        <p>
          We may update these terms. Continued use after updates means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about these terms can be submitted via the contact page.
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