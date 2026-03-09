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

  const handleNavClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith('#')) {
        setIsMobileMenuOpen(false);
        return;
      }

      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setIsMobileMenuOpen(false);
    };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

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
          <a
            href="#top"
            onClick={handleNavClick('#top')}
            className="flex items-center shrink-0"
            aria-label="TrainMeter - Go to homepage"
          >
            {/* Mobile: icon only */}
            <div className="flex lg:hidden items-center gap-2">
              <img
                src="/images/trainmeter-icon.svg"
                alt="TrainMeter"
                className="h-8 w-8 object-contain"
                loading="eager"
              />
              <span className="text-base font-bold text-white tracking-wide">
                TrainMeter
              </span>
            </div>

            {/* Desktop: full logo */}
            <img
              src="/images/trainmeter-logo.svg"
              alt="TrainMeter"
              className="hidden lg:block h-10 w-auto object-contain"
              loading="eager"
            />
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

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/5"
              asChild
            >
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
              <a href="#contact" onClick={handleNavClick('#contact')}>
                Get Started
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#27273a] p-4 animate-fade-in">
            <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-[#27273a]">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-slate-300 hover:text-white hover:bg-white/5"
                  asChild
                >
                  <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Log in
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-center text-slate-300 hover:text-white hover:bg-white/5"
                  asChild
                >
                  <a href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign up
                  </a>
                </Button>

                <Button
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] border-0 font-semibold"
                  asChild
                >
                  <a href="#contact" onClick={handleNavClick('#contact')}>
                    Get Started
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
