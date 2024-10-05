import React, { useState, useEffect } from 'react';

const generateCommsData = (prevData: CommsDataType) => {
  const variation = 0.05;
  return {
    uplink: Math.max(10, Math.min(1000, prevData.uplink * (1 + (Math.random() - 0.5) * variation))),
    downlink: Math.max(10, Math.min(1000, prevData.downlink * (1 + (Math.random() - 0.5) * variation))),
    latency: Math.max(20, Math.min(2000, prevData.latency * (1 + (Math.random() - 0.5) * variation))),
    signalStrength: Math.max(-100, Math.min(-50, prevData.signalStrength + (Math.random() - 0.5) * 2)),
    bitErrorRate: Math.max(1e-9, Math.min(1e-6, prevData.bitErrorRate * (1 + (Math.random() - 0.5) * variation))),
  };
};

interface CommsDataType {
  uplink: number;
  downlink: number;
  latency: number;
  signalStrength: number;
  bitErrorRate: number;
}

const CommsData: React.FC = () => {
  const [commsData, setCommsData] = useState<CommsDataType>({
    uplink: 436.30,
    downlink: 80.19,
    latency: 1002.12,
    signalStrength: -64.03,
    bitErrorRate: 9.91e-8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCommsData(prevData => generateCommsData(prevData));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
     
    <div className="bg-white text-black  rounded-sm flex flex-col flex-grow w-1/2">
      
      <div className=' border-b border-gray-200 text-sm p-1 uppercase font-semibold  '> 
        Transmission <span className=' text-[10px] font-light'>X-band (7-11.2 GHz)</span>
      </div>

      <div className="grid grid-cols-2   h-1/2 border-b border-gray-200">
        <div className="flex flex-col items-center border-r border-gray-200 p-2">
          <div className="text-xs font-semibold">Uplink</div>
          <div className="text-2xl font-bold flex flex-col items-center">{commsData.uplink.toFixed(2)} <span className="text-xs font-normal">Mbps</span></div>
          
        </div>
        <div className="flex flex-col items-center p-2">
          <div className="text-xs font-semibold">Downlink</div>
          <div className="text-2xl font-bold flex flex-col items-center">{commsData.downlink.toFixed(2)} <span className="text-xs font-normal">Mbps</span></div>
          
        </div>
      </div>
      <div className="flex flex-row flex-grow text-center text-xs">
        <div className=" border-r p-1 flex-grow w-1/3">
          <div className=" font-semibold  "> End-to-End Latency</div>
          <div>{commsData.latency.toFixed(2)} ms</div>
        </div>
        <div className=" border-r p-1 w-1/3">
          <div className=" font-semibold"> Signal Strength</div>
          <div >{commsData.signalStrength.toFixed(2)} dBm</div>
        </div>
        <div className=" p-1 w-1/3">
          <div className=" font-semibold">Bit Error Rate</div>
          <div >{commsData.bitErrorRate.toExponential(2)}</div>
        </div>
      </div>
      

    </div>
  );
};

export default CommsData;


/*  <div className="bg-white text-black  text-xs p-2 rounded-sm flex flex-col h-full w-[16%]"> */