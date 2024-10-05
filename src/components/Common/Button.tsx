import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  text: string;
  link: string;
  className?: string;
  external?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, link, className = '', external = false }) => {
  const baseClasses = 'inline-block p-2 bg-white text-black font-mono rounded-sm  text-sm uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white';
  
  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (external) {
    return (
      <a href={link} className={combinedClasses} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    );
  }

  return (
    <Link to={link} className={combinedClasses}>
      {text}
    </Link>
  );
};

export default Button;
