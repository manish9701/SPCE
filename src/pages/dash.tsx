import React from 'react';
import SatData from '../components/Common/satData';
import InstrumentData from '../components/Common/instrumentdata';
import SW from '../components/Common/sw';




const Dashboard: React.FC = () => {
  /* const satData = {
    satId: 'SAT1586',
    nextTransmission: 27,
    creditsLeft: 20,
    latitude: 200,
    longitude: 200,
    altitude: 550.25,
    speed: 27000,
    period: 97,
  }; */

  return (
    <div className="flex flex-col p-2 h-full w-full">
    {/*   <div className='flex justify-between items-center mb-2'>
        <h1 className="font-mono text-xl font-medium flex items-center ">
        Dashboard
      </h1>

      <div className="flex justify-between gap-2 ">
      <Link to="/YourFleet" className="bg-white  text-black text-sm p-1 rounded-sm uppercase">View Your Fleet</Link>
        <button className=" bg-white  text-black text-sm p-1 rounded-sm uppercase">
          Add New Satellite
        </button>
      </div>
   </div> */}
      

      <div className="flex flex-grow w-full h-full">
        <div className="flex-grow bg-zinc-200 p-2 rounded-sm  w-full h-full">
          <div className="flex flex-row gap-2 w-full h-full">
            <SatData/>
            <InstrumentData />
            {/* <div className='flex-grow  w-[16%] bg-white rounded-sm '>
              
            </div> */}
            <SW />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

