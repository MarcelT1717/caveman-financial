import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin } from 'lucide-react';

const Footer = () => {
  const sectors = [
    'Aviation',
    'Quantum Computing',
    'Space Technology',
    'Robotics & AI',
    'Energy Storage',
    'Nuclear Energy',
    'Critical Minerals',
    'Healthcare',
    'AI & Data',
    'Crypto Infrastructure'
  ];

  return (
    <footer className="footer-redesign">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand & Contact */}
          <div className="footer-brand-section">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_21a7493f-957d-4ce7-a410-1ccdb2a9f4f5/artifacts/zqclioe8_lololololo.jfif" 
                alt="Caveman Financial" 
                className="h-10 w-auto"
              />
              <span className="h4">Caveman Financial</span>
            </div>
            <p className="body-md text-text-muted mb-6 max-w-sm">
              Specialized small cap investing insights for emerging sectors and breakthrough technologies.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:newsletter@caveman-financial.com" 
                className="footer-icon-link"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/company/caveman-financial/" 
                className="footer-icon-link"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/sectors" className="footer-link">Sectors</Link></li>
              <li><Link to="/library" className="footer-link">Library</Link></li>
            </ul>
          </div>

          {/* All Sectors */}
          <div className="footer-sectors-section">
            <h4 className="footer-heading">Investment Sectors</h4>
            <ul className="footer-sectors-grid">
              {sectors.map((sector, index) => (
                <li key={index}>
                  <Link to="/sectors" className="footer-link">
                    {sector}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="body-sm text-text-muted">
              © 2026 Caveman Financial. All rights reserved.
            </p>
            <div className="flex space-x-6">
             <a 
               href="/Caveman%20Financial%20Privacy%20Policy.pdf"
               target="_blank"
               rel="noopener noreferrer"
               className="body-sm text-text-muted hover:text-accent-primary transition-colors"
             >
               Privacy Policy
             </a>

             <a 
               href="/Caveman%20Financial%20Terms.pdf"
               target="_blank"
               rel="noopener noreferrer"
               className="body-sm text-text-muted hover:text-accent-primary transition-colors"
             >
               Terms of Service
             </a>

             <a 
               href="/Caveman%20Financial%20Disclaimer.pdf"
               target="_blank"
               rel="noopener noreferrer"
               className="body-sm text-text-muted hover:text-accent-primary transition-colors"
             >
               Disclaimer
             </a>
           </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
