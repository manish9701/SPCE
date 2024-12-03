import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  image: string;
  name: string;
  link: string;
}

const Card: React.FC<CardProps> = ({ image, name, link }) => {
  return (
    <Link to={link} className="block w-full h-full">
      <div className="bg-white border border-gray-300 rounded-sm h-full flex flex-col items-center justify-between p-2">
        <div className="flex-grow flex items-center justify-center w-full">
          <img src={image} alt={name} className="w-full h-40 object-contain mix-blend-exclusion" />
        </div>
        <h3 className="font-mono text-xs font-medium text-black uppercase text-center mt-2 truncate w-full">
          {name}
        </h3>
      </div>
    </Link>
  );
};

export default Card;
