import React, { useEffect } from 'react';
import Button from '../components/Common/Button';

const Home: React.FC = () => {
  useEffect(() => {
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-16 bottom-16 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center overflow-hidden">
        <h2 className="text-3xl md:text-2xl font-mono mb-4 md:mb-6">Empowering Space Exploration for Everyone</h2>
        <p className="font-mono text-sm mb-4 md:mb-6">Unlock access to satellites for any mission—education, research, or business. Choose your satellite, orbit, and duration, and start exploring space with ease. Empower your projects and reach beyond the stars.</p>
        <div className="flex gap-2">
        <Button text="CALCULATE" link="/services" />
        <Button text="OUR FLEET" link="/fleet" />
        <Button text="DOWNLOAD SPEC SHEET" link="/spec-sheet" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex-grow overflow-hidden">
        <img 
          src={require('../assets/earth.png')} 
          alt="Earth" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Home;
