import { Link } from "react-router-dom";
import { Mail, Instagram, Twitter, Shield, Globe } from "lucide-react";
import Brand from "../common/Brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#27273a] bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Info */}
          <div className="md:col-span-1 space-y-4">
            <Brand text="FitTrack" />
            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
              Premium management platform for elite trainers and dedicated clients. 
              Built for performance.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink icon={<Instagram size={16} />} href="#" />
              <SocialLink icon={<Twitter size={16} />} href="#" />
              <SocialLink icon={<Mail size={16} />} href="mailto:fittrackappsupp@gmail.com" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Navigation</h4>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/contact" label="Contact" />
              <FooterLink to="/guide" label="User Guide" />
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Platform</h4>
            <ul className="space-y-2">
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/cookies" label="Cookie Policy" />
            </ul>
          </div>

          {/* Status / Badge */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">System Status</h4>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">All Systems Operational</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight">
              Designed & Developed for Professional Coaching Excellence.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#27273a] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>© {currentYear} FITTRACK APP</span>
            <span className="text-slate-800">|</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Globe size={12} className="text-amber-400" />
              <span>GLOBAL ACCESS</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={12} className="text-amber-400" />
              <span>SECURE DATA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper za Linkove
function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link to={to} className="text-[11px] font-bold text-slate-500 hover:text-amber-400 uppercase tracking-tight transition-colors">
        {label}
      </Link>
    </li>
  );
}

// Helper za Social
function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a href={href} className="w-8 h-8 rounded-lg bg-[#111118] border border-[#27273a] flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-400/30 transition-all">
      {icon}
    </a>
  );
}