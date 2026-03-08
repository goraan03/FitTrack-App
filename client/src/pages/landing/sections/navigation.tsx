import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../components/Button';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return; // external links
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#27273a]'
          : 'bg-[#0a0a0f]/80 backdrop-blur-md'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#top" onClick={handleNavClick('#top')} className="flex items-center gap-3 group" aria-label="TrainoraX - Go to homepage">
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center shadow-inner">
              <img
                src="/images/fittrack-logo-transparent.png"
                alt="TrainoraX logo"
                className="h-7 w-7 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TrainoraX</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick(link.href)}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" asChild>
              <a href="/login">Log in</a>
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/5"
              asChild
            >
              <a href="/register">Sign up</a>
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0a0a0f] border-0 shadow-lg shadow-amber-500/25 font-semibold"
              asChild
            >
              <a href="#contact">Get Started</a>
            </Button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#27273a] p-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className="text-base font-medium text-slate-300 hover:text-white py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#27273a]">
                <Button variant="ghost" className="w-full justify-center text-slate-300" asChild>
                  <a href="/login">Log in</a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-slate-300"
                  asChild
                >
                  <a href="/register">Sign up</a>
                </Button>
                <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] border-0 font-semibold" asChild>
                  <a href="#contact">Get Started</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
