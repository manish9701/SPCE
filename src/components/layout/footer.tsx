import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-1 px-2 font-space-grotesk ">
      <div className="container mx-0 flex gap-8">
        <div className="flex items-center">
          <img src={require('../../assets/logo.png')} alt="SPCE" className="h-2.5 mr-4" />
          <p className="text-xs">&copy; 2024 SPCE. All rights reserved.</p>
        </div>
        <nav>
          <ul className="flex space-x-6 text-xs">
            <li><a href="/" className="hover:text-gray-300">Security</a></li>
            <li><a href="/about" className="hover:text-gray-300">Privacy</a></li>
            <li><a href="/services" className="hover:text-gray-300">Satellites</a></li>
            <li><a href="/contact" className="hover:text-gray-300">Contact</a></li>
            <li><a href="/contact" className="hover:text-gray-300">About</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
