import React from 'react';
import { Settings } from '../../types';
import { Facebook, Twitter, Instagram, Mail, Globe, Shield, FileText } from 'lucide-react';

interface FooterProps {
  settings: Settings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand and Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">{settings?.app_name || 'KSoT Portal'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Inspiring the next generation through knowledge, leadership, and analytical excellence.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {settings?.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-400 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                  <Globe className="w-4 h-4" /> {/* Fallback or add Youtube icon */}
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-xs uppercase tracking-widest">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${settings?.contact_email || 'info@ksot.org'}`} className="text-slate-500 hover:text-violet-600 text-sm flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" /> {settings?.contact_email || 'Contact Support'}
                </a>
              </li>
              <li>
                <a href={settings?.privacy_url || '#'} className="text-slate-500 hover:text-violet-600 text-sm flex items-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" /> Privacy Policy
                </a>
              </li>
              <li>
                <a href={settings?.terms_url || '#'} className="text-slate-500 hover:text-violet-600 text-sm flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" /> Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Location/Stat */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-xs uppercase tracking-widest">Reach</h4>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" /> Serving across 32 Districts
            </p>
            <p className="text-slate-400 text-xs mt-4">
              Providing quality educational resources and competition platforms for Tamil Nadu students.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">
            &copy; {currentYear} {settings?.app_name || 'KSoT Portal'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Made for Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
