import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';

const SubscribeModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');

    // Show success after brief loading, then close
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        onClose();
      }, 2000);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="subscribe-modal-overlay" onClick={onClose} data-testid="subscribe-modal-overlay">
      <div 
        className="subscribe-modal-container" 
        onClick={(e) => e.stopPropagation()}
        data-testid="subscribe-modal"
      >
        {/* Close Button */}
        <button 
          className="subscribe-modal-close" 
          onClick={onClose}
          data-testid="subscribe-modal-close"
        >
          <X size={24} />
        </button>

        {status === 'success' ? (
          <div className="subscribe-modal-success" data-testid="subscribe-success">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
            <p className="text-gray-300">Welcome to the Caveman Financial newsletter!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="subscribe-modal-header">
              <div className="subscribe-modal-icon">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="subscribe-modal-title">Join the Newsletter</h2>
              <p className="subscribe-modal-subtitle">
                Get weekly insights on small cap opportunities, sector analysis, and market updates.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="subscribe-modal-form">
              <div className="subscribe-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  className={`subscribe-input ${status === 'error' ? 'error' : ''}`}
                  data-testid="subscribe-email-input"
                  autoFocus
                />
                {status === 'error' && (
                  <p className="subscribe-error-text" data-testid="subscribe-error">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="subscribe-modal-button"
                disabled={status === 'loading'}
                data-testid="subscribe-submit-button"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Subscribe - It's Free
                  </>
                )}
              </button>
            </form>

            {/* Footer Note */}
            <p className="subscribe-modal-footer">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscribeModal;
