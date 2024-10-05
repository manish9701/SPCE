import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { ReactComponent as ArrowBackIcon } from '../../assets/arrow_back.svg'; 

const Backbutton: React.FC = () => {
  const navigate = useNavigate(); 

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    

        <button 
          onClick={handleBack} 
          className="mr-2 p-0 w-8 h-8 rounded-sm flex items-center justify-center bg-white">

          <ArrowBackIcon className="size-4 " /> 

        </button>

  )
};

export default Backbutton;        