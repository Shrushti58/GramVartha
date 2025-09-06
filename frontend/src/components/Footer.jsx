import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-white text-black p-8 mt-16 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium opacity-90">{t("footer")}</p>
        </div>
        
        {/* Footer Links & Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">GramVartha</h3>
            <p className="text-gray-600 text-sm">
              Connecting communities through trusted local information.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['about', 'features', 'notices', 'grievance', 'contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item}`} 
                    className="text-gray-600 hover:text-black transition-colors duration-300 text-sm"
                  >
                    {t(`footer_${item}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Links */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              {[
                { icon: 'fab fa-facebook-f', label: 'Facebook' },
                { icon: 'fab fa-twitter', label: 'Twitter' },
                { icon: 'fab fa-instagram', label: 'Instagram' },
                { icon: 'fab fa-linkedin-in', label: 'LinkedIn' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright & Legal */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GramVartha. {t('footer_rights')}
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            {['privacy', 'terms', 'cookies'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-xs text-gray-500 hover:text-black transition-colors duration-300"
              >
                {t(`footer_${item}`)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}