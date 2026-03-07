import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Grid, BookOpen, Mail } from 'lucide-react';
import { useSubscribe } from '../context/SubscribeContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { openSubscribeModal } = useSubscribe();

  const navLinks = [
    { path: '/sectors', label: 'Sectors', icon: Grid },
    { path: '/library', label: 'Library', icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-sticky">
      <nav className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clickable to Home */}
          <Link to="/" className="flex items-center space-x-3 hover-lift">
            <img 
              src="https://customer-assets.emergentagent.com/job_21a7493f-957d-4ce7-a410-1ccdb2a9f4f5/artifacts/zqclioe8_lololololo.jfif" 
              alt="Caveman Financial" 
              className="h-12 w-auto"
            />
            <span className="h3 hidden sm:block">Caveman Financial</span>
          </Link>

          {/* Desktop Navigation - Boxy Pills on Right */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-pill ${isActive(link.path) ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <button 
              className="nav-pill subscribe-pill"
              onClick={openSubscribeModal}
              data-testid="header-subscribe-button"
            >
              <Mail className="w-4 h-4" />
              <span>Subscribe</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-pill ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button 
                className="nav-pill subscribe-pill w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSubscribeModal();
                }}
                data-testid="header-subscribe-button-mobile"
              >
                <Mail className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
