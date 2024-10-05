/* import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {

  image: string;   // {{ edit_1 }} Prop for GIF URL

  name: string;  // {{ edit_2 }} Prop for the name

  link: string;  // {{ edit_3 }} Prop for the link

}


const Card: React.FC<CardProps> = ({ image, name, link }) => {

  return (
    <main className='flex-full justify-center items-center size-full'>  {{ edit_1 }} Center content 
        
        <Link to={link} className="block">

      <div className="bg-white rounded-sm size-full flex flex-col items-center">  {{ edit_2 }} Center image and name 

        <img src={image} alt={name} className="size-40 object-cover mix-blend-exclusion bg-white" />  {{ edit_3 }} Keep image square 
        <div className="p-2">

          <h3 className="font-mono text-sm font-medium  text-black uppercase">{name}</h3>  {{ edit_4 }} Name display 

        </div>
      </div>

    </Link>
    </main>
    

  );
};

export default Card;
 */


import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  image: string;   // Prop for GIF URL
  name: string;    // Prop for the name
  link: string;    // Prop for the link
}

const Card: React.FC<CardProps> = ({ image, name, link }) => {
  return (
    <div className='flex justify-center items-center rounded-sm bg-white p-2'> {/* Center content */}
      <Link to={link} className="block">
        <div className=" flex flex-col items-center justify-between"> {/* Center image and name */}
        <img src={image} alt={name} className=" flex-grow size-40  mix-blend-exclusion " /> {/* Keep image square */}
          <div className="pt-2">
            <h3 className="font-mono text-sm font-medium text-black uppercase">{name}</h3> {/* Name display */}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;