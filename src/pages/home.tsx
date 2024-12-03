import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="fixed inset-x-0 top-16 bottom-16 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center overflow-hidden">
        <h2 className="text-3xl md:text-2xl font-mono mb-4 md:mb-6">Empowering Space Exploration for Everyone</h2>
        <p className="font-mono text-sm mb-4 md:mb-6">Unlock access to satellites for any mission—education, research, or business. Choose your satellite, orbit, and duration, and start exploring space with ease. Empower your projects and reach beyond the stars.</p>
        <div className="bg-white rounded-sm flex items-center h-7 w-fit">
          <Link to="/services" className="text-black hover:bg-gray-200 px-3 py-1 h-full flex items-center text-xs uppercase font-medium">
            Calculate
          </Link>
          <div className="h-5 w-px bg-gray-300"></div>
          <Link to="/fleet" className="text-black hover:bg-gray-200 px-3 py-1 h-full flex items-center text-xs uppercase font-medium">
            Our Fleet
          </Link>
          <div className="h-5 w-px bg-gray-300"></div>
          <Link to="/spec-sheet" className="text-black hover:bg-gray-200 px-3 py-1 h-full flex items-center text-xs uppercase font-medium">
            Download Spec Sheet
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex-grow overflow-hidden">
        <img 
          src={require('../assets/3.jpg')} 
          alt="Earth" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Home;
