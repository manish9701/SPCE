import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname.slice(1);
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Home';
  };

  const getButtonStyle = (path: string) => {
    const isActive = location.pathname === path;
    return `px-2 py-2 rounded ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`;
  };

  const renderMainNavigation = () => {
    if (location.pathname === '/') {
      return (
        <>
          <Link to="/research" className={getButtonStyle('/research')}>
            Research <span className="text-gray-500 ml-2">01</span>
          </Link>
          <Link to="/intelligence" className={getButtonStyle('/intelligence')}>
            Intelligence <span className="text-gray-500 ml-2">02</span>
          </Link>
          <Link to="/compute" className={getButtonStyle('/compute')}>
            Compute <span className="text-gray-500 ml-2">03</span>
          </Link>
        </>
      );
    }
    return null;
  };

  const renderSecondaryNavigation = () => {
    if (location.pathname === '/') {
      return (
        <>
          <Link to="/docs" className="text-gray-300 hover:text-white">Docs</Link>
          <Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link>
          <Link to="/careers" className="text-gray-300 hover:text-white">Careers</Link>
          <Link to="/help" className="text-gray-300 hover:text-white">?</Link>
        </>
      );
    }
    
  };

  const renderDashboardNavigation = () => {
    if (location.pathname === '/dashboard') {
      return (
        <div className=" h-full flex items-center   rounded-sm gap-2">
          <Link to="/add-satellite" className="text-black text-sm bg-white hover:bg-gray-100 px-2 py-1 rounded-sm">Add Satellite</Link>
          <Link to="/YourFleet" className="text-black text-sm bg-white hover:bg-gray-100 px-2 py-1 rounded-sm">Your Fleet</Link>
          <Link to="/profile" className="text-black text-sm bg-white hover:bg-gray-100 px-2 py-1 rounded-sm">Profile</Link>
          <Link to="/support" className="text-black text-sm bg-white hover:bg-gray-100 px-2 py-1 rounded-sm">Support</Link>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="bg-black px-2 pt-2  ">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <Link to='/'><img src={require('../../assets/logoB.png')} alt="SPCE" className="h-7  p-2 bg-white rounded-sm mix-blend-exclusion" /></Link>
        <span className='text-black bg-white px-2 py-1 rounded-sm flex-grow text-sm'>{getPageName()}</span>
        <nav className="flex items-center space-x-2">
          {renderMainNavigation()}
          {renderDashboardNavigation()}
          {renderSecondaryNavigation()}
         {/*  <Link to="/login" className="text-gray-300 hover:text-white ml-4">Login</Link>
          <Link to="/register" className="bg-white text-black p-1 rounded-sm text-sm uppercase">
            Register <span className="ml-2"></span>
          </Link> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
