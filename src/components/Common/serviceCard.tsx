import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  name: string;
  imageUrl: string;
  link: string;
  
}

const ServiceCard: React.FC<ServiceCardProps> = ({ name, imageUrl, link }) => {
  const cardContent = (
    <div className="bg-white  rounded-sm  w-auto h-auto">
      <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      <div className="p-4">
        <h3 className="font-mono text-sm font-bold mb-2 text-black">{name}</h3>
        
      </div>
    </div>
  );

  

  return (
    <Link to={link} className="block">
      {cardContent}
    </Link>
  );
};

export default ServiceCard;
