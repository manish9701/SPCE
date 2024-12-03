import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import pacGif from '../../assets/pac.gif';
import logoB from '../../assets/logoB.png';

const newsItems = [
  "Breaking News: SPCE Successfully Launches New Satellite Constellation",
  "SPCE Announces Revolutionary Quantum Communication Breakthrough",
  "SPCE's Latest AI-Powered Satellites Set to Transform Global Connectivity",
  "SPCE Partners with NASA for Upcoming Mars Mission",
  "SPCE's Stock Soars as Company Unveils Next-Gen Space Technology"
];

const Header: React.FC = () => {
  const location = useLocation();
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPageName = () => {
    if (location.pathname === '/') return newsItems[currentNewsIndex];
    
    // Get the path and decode any URL encoded characters
    const path = decodeURIComponent(location.pathname.slice(1));
    
    // First remove the "20%" if it exists
    const cleanPath = path.includes('20%') 
      ? path.substring(0, path.indexOf('20%')).trim()
      : path;

    // Then format the remaining text
    return cleanPath
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderNavLinks = (links: { to: string; text: string }[]) => (
    <div className="bg-white rounded-sm flex items-center">
      {links.map((link, index) => (
        <React.Fragment key={link.to}>
          {index > 0 && <div className="h-5 w-px bg-gray-300"></div>}
          <Link to={link.to} className="text-black hover:bg-gray-200 px-3 py-1 h-full flex items-center text-xs uppercase font-medium">
            {link.text}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );

  const renderNewsSection = () => {
    if (location.pathname === '/') {
      return (
        <div className='flex-grow flex flex-row gap-2 h-[24px] '>
          <div className="flex-grow flex items-center bg-white rounded-sm h-full overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
            <div className="relative w-full h-full flex items-center overflow-hidden">
              <motion.div
                animate={{ x: [0, -100 * newsItems.length + '%'] }}
                transition={{ x: { repeat: Infinity, repeatType: "loop", duration: newsItems.length * 30, ease: "linear" } }}
                className="flex whitespace-nowrap absolute left-0"
              >
                {newsItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <span className="text-black text-sm inline-flex items-center justify-center px-4">{item}</span>
                    {index < newsItems.length - 1 && <span className="text-black inline-flex items-center justify-center px-2">|</span>}
                  </React.Fragment>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      );
    }
    return <span className='text-black bg-white px-2 py-1 rounded-sm flex-grow text-sm h-[24px] flex items-center'>{getPageName()}</span>;
  };

  const renderNavigation = () => {
    if (location.pathname === '/dashboard') {
      return renderNavLinks([
        { to: "/add-satellite", text: "Add Satellite" },
        { to: "/YourFleet", text: "Your Fleet" },
        { to: "/profile", text: "Profile" },
        { to: "/support", text: "Support" }
      ]);
    }
    return (
      <>
        {renderNavLinks([
          { to: "/research", text: "Research" },
          { to: "/careers", text: "Careers" },
          { to: "/intelligence", text: "Intelligence" }
        ])}
        {location.pathname !== '/' && renderNavLinks([
          { to: "/fleet", text: "Our Fleet" },
          { to: "/services", text: "Calculate" },
          { to: "/enquiry", text: "Enquiry" }
        ])}
      </>
    );
  };

  return (
    <header className="bg-black px-2 pt-2">
      <div className="container mx-auto flex items-center justify-between gap-2 h-[24px]">
        <Link to='/'><img src={logoB} alt="SPCE" className="h-[24px] p-2 bg-white rounded-sm mix-blend-exclusion" /></Link>
        {renderNewsSection()}
        <div className="flex items-center gap-2">
          {renderNavigation()}
          {location.pathname === '/' && <img src={pacGif} alt="Loading" className="h-7" />}
        </div>
      </div>
    </header>
  );
};

export default Header;
