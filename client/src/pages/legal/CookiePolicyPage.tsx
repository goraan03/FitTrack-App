import LegalLayout from "../../layouts/LegalLayout";
import { useSettings } from "../../context/SettingsContext";

export default function CookiePolicyPage() {
  const { t } = useSettings();
  return (
    <LegalLayout
      badge={t('cookie_badge') || "Cookies & Storage"}
      title={
        <>
          {(t('cookie_title') || "COOKIE POLICY").replace(' POLICY', '')} <span className="text-amber-400">POLICY</span>
        </>
      }
      subtitle={t('cookie_subtitle') || "This policy explains how cookies and local storage are used to keep the platform secure and functional."}
    >
      <Meta t={t} />

      <LegalSection title={t('cookie_sec1_title') || "1. What Cookies Are"}>
        <p>{t('cookie_sec1_desc') || "Cookies are small text files stored in your browser. They help websites remember preferences and maintain sessions."}</p>
      </LegalSection>

      <LegalSection title={t('cookie_sec2_title') || "2. What We Use"}>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="text-slate-300 font-semibold">Essential:</span> {t('cookie_sec2_li1') || "authentication and session continuity."}</li>
          <li><span className="text-slate-300 font-semibold">Security:</span> {t('cookie_sec2_li2') || "protection against abuse and unauthorized access."}</li>
          <li><span className="text-slate-300 font-semibold">Preferences:</span> {t('cookie_sec2_li3') || "basic UI preferences where applicable."}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('cookie_sec3_title') || "3. Local Storage"}>
        <p>{t('cookie_sec3_desc') || "Some data may be stored locally (e.g., temporary authentication flows) to improve user experience. You can clear this in your browser settings."}</p>
      </LegalSection>

      <LegalSection title={t('cookie_sec4_title') || "4. Managing Cookies"}>
        <p>{t('cookie_sec4_desc') || "You can control cookies via browser settings. Disabling essential cookies may prevent login or core features from working correctly."}</p>
      </LegalSection>

      <LegalSection title={t('cookie_sec5_title') || "5. Contact"}>
        <p>{t('cookie_sec5_desc') || "If you have questions about cookies, please contact us via the contact page."}</p>
      </LegalSection>
    </LegalLayout>
  );
}

function Meta({ t }: { t: (key: string) => string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetaCard label={t('policy_status') || "Policy Status"} value={t('active') || "Active"} />
      <MetaCard label={t('last_updated') || "Last Updated"} value="22.02.2026." />
      <MetaCard label={t('applies_to') || "Applies To"} value={t('public_website_app') || "Public website & app"} />
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