import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Changed Switch to Routes
import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Home from './pages/home';
import Services from './pages/services';
import SatInfo from './pages/SatInfo';
/* import Satconfirm from './pages/satconfirm'; // Import SatConfirm */
import Dashboard from './pages/dash'
import YourFleet from './pages/YourFleet';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-black text-white">
        <Header />
        <main className="flex-grow">
          <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/satinfo/:category" element={<SatInfo />} /> 
            <Route path="/SatInfo" element={<SatInfo />} /> {/* Ensure this route is defined */}
           {/*  <Route path="/satconfirm" element={<Satconfirm />} /> */} {/* Add this route */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/YourFleet" element={<YourFleet />} />
          </Routes> 
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
