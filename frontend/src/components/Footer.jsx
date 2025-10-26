import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-50 to-primary-100 text-primary-900 p-8 border-t border-primary-200 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium opacity-90">
            Empowering rural communities through digital innovation and transparent governance
          </p>
        </div>
        
        {/* Footer Links & Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 text-primary-700 font-serif">GramVartha</h3>
            <p className="text-primary-600 text-sm">
              Connecting communities through trusted local information and digital governance solutions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4 text-primary-800">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'About', href: '#about' },
                { name: 'Features', href: '#features' },
                { name: 'Notices', href: '#notices' },
                { name: 'Grievance', href: '#grievance' },
                { name: 'Contact', href: '#contact' }
              ].map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-primary-600 hover:text-primary-700 transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Links */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-4 text-primary-800">Connect With Us</h4>
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
                  className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 hover:bg-primary-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright & Legal */}
        <div className="pt-6 border-t border-primary-200 text-center">
          <p className="text-sm text-primary-600">
            © {new Date().getFullYear()} GramVartha. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            {[
              { name: 'Privacy Policy', href: '#' },
              { name: 'Terms of Service', href: '#' },
              { name: 'Cookie Policy', href: '#' }
            ].map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-xs text-primary-600 hover:text-primary-700 transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
