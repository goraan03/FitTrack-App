import LegalLayout from "../../layouts/LegalLayout";
import { useSettings } from "../../context/SettingsContext";

export default function TermsOfServicePage() {
  const { t } = useSettings();
  return (
    <LegalLayout
      badge={t('platform_rules_badge') || "Platform Rules"}
      title={
        <>
          {(t('terms_of_service_title') || "TERMS OF SERVICE").replace(' OF SERVICE', '')} <span className="text-amber-400">OF SERVICE</span>
        </>
      }
      subtitle={t('terms_subtitle') || "These terms define how the platform can be used and what users can expect from the service."}
    >
      <Meta t={t} />

      <LegalSection title={t('terms_sec1_title') || "1. Agreement"}>
        <p>{t('terms_sec1_desc') || "By accessing or using TrainoraX, you agree to these Terms of Service and any applicable laws. If you do not agree, do not use the platform."}</p>
      </LegalSection>

      <LegalSection title={t('terms_sec2_title') || "2. Accounts & Access"}>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t('terms_sec2_li1') || "Clients can self-register."}</li>
          <li>{t('terms_sec2_li2') || "Trainer accounts are created and managed by an administrator."}</li>
          <li>{t('terms_sec2_li3') || "You are responsible for maintaining the confidentiality of your credentials."}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('terms_sec3_title') || "3. Acceptable Use"}>
        <p>{t('terms_sec3_desc') || "You agree not to:"}</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>{t('terms_sec3_li1') || "Use the platform for unlawful activities."}</li>
          <li>{t('terms_sec3_li2') || "Attempt to access other accounts or restricted data."}</li>
          <li>{t('terms_sec3_li3') || "Upload malicious content or disrupt service availability."}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('terms_sec4_title') || "4. Training Disclaimer"}>
        <p>{t('terms_sec4_desc') || "TrainoraX is a management platform. Training programs and coaching decisions are the responsibility of trainers and clients. Always follow professional guidance and prioritize safety."}</p>
      </LegalSection>

      <LegalSection title={t('terms_sec5_title') || "5. Availability"}>
        <p>{t('terms_sec5_desc') || "We aim for reliable service, but availability can be affected by maintenance, updates, or technical issues. We may modify or discontinue features to improve the platform."}</p>
      </LegalSection>

      <LegalSection title={t('terms_sec6_title') || "6. Limitation of Liability"}>
        <p>{t('terms_sec6_desc') || "To the extent permitted by law, TrainoraX is not liable for indirect damages or losses arising from the use of the platform, including business decisions or training outcomes."}</p>
      </LegalSection>

      <LegalSection title={t('terms_sec7_title') || "7. Changes to Terms"}>
        <p>{t('terms_sec7_desc') || "We may update these terms. Continued use after updates means you accept the revised terms."}</p>
      </LegalSection>

      <LegalSection title={t('terms_sec8_title') || "8. Contact"}>
        <p>{t('terms_sec8_desc') || "Questions about these terms can be submitted via the contact page."}</p>
      </LegalSection>
    </LegalLayout>
  );
}

function Meta({ t }: { t: (key: string) => string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetaCard label={t('policy_status') || "Policy Status"} value={t('active') || "Active"} />
      <MetaCard label={t('last_updated') || "Last Updated"} value="22.02.2026." />
      <MetaCard label={t('applies_to') || "Applies To"} value={t('all_users') || "All users"} />
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
