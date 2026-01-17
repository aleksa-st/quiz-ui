import React from 'react';
import { AppSettings } from '../../types';

interface FooterProps {
  settings: AppSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">About</a>
            {settings?.privacy_url ? (
              <a href={settings.privacy_url} className="text-gray-400 hover:text-gray-500">Privacy</a>
            ) : (
              <a href="#" className="text-gray-400 hover:text-gray-500">Privacy</a>
            )}
            {settings?.terms_url ? (
              <a href={settings.terms_url} className="text-gray-400 hover:text-gray-500">Terms</a>
            ) : (
              <a href="#" className="text-gray-400 hover:text-gray-500">Terms</a>
            )}
            {settings?.contact_email ? (
              <a href={`mailto:${settings.contact_email}`} className="text-gray-400 hover:text-gray-500">Contact</a>
            ) : (
              <a href="#" className="text-gray-400 hover:text-gray-500">Contact</a>
            )}
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {settings?.app_name || 'QuizMaster Pro'}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};