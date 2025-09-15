import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gradient-to-r from-[#FFF9E6] to-[#f8f1de] text-[#37474F] p-8 mt-16 border-t border-[#f5edd8]">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium opacity-90">{t("footer")}</p>
        </div>
        
        {/* Footer Links & Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 text-[#2E8B57]">GramVartha</h3>
            <p className="text-[#5a6c75] text-sm">
              Connecting communities through trusted local information.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4 text-[#37474F]">Quick Links</h4>
            <ul className="space-y-2">
              {['about', 'features', 'notices', 'grievance', 'contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item}`} 
                    className="text-[#5a6c75] hover:text-[#2E8B57] transition-colors duration-300 text-sm"
                  >
                    {t(`footer_${item}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Links */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-4 text-[#37474F]">Connect With Us</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              {[
                { icon: 'fab fa-facebook-f', label: 'Facebook', color: 'hover:bg-[#2E8B57]' },
                { icon: 'fab fa-twitter', label: 'Twitter', color: 'hover:bg-[#4A90E2]' },
                { icon: 'fab fa-instagram', label: 'Instagram', color: 'hover:bg-[#B5651D]' },
                { icon: 'fab fa-linkedin-in', label: 'LinkedIn', color: 'hover:bg-[#2E8B57]' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className={`w-10 h-10 rounded-full bg-[#f5edd8] flex items-center justify-center text-[#5a6c75] ${social.color} hover:text-white transition-all duration-300 transform hover:scale-110`}
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright & Legal */}
        <div className="pt-6 border-t border-[#f5edd8] text-center">
          <p className="text-sm text-[#5a6c75]">
            © {new Date().getFullYear()} GramVartha. {t('footer_rights')}
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            {['privacy', 'terms', 'cookies'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-xs text-[#5a6c75] hover:text-[#2E8B57] transition-colors duration-300"
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