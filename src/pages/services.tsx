/* import React from 'react';
import Card from '../components/Common/Card';

const services: React.FC = () => {
  return (
    <div className="fixed w-full ">
      <main className="bg-black text-white p-4 h-full flex flex-col">
        <h1 className="text-2xl font-mono mb-6">What's the purpose of Your Project?</h1>

        <p className="font-mono text-sm mb-8">
          Select the purpose of your project from the options listed below. It helps us provide the best options.
        </p>

        <div className=" grid grid-cols-5 grid-rows-2 gap-2">
          <Card
            image="/images/EO.gif"
            name="Earth Observation"
            link="/SatInfo"
          />
          <Card
            image="/images/EO.gif"
            name="Navigation"
            link="#"
          />
          <Card
            image="/images/Eo.gif"
            name="Space Observation"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Communication"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="experimental"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Military surveillance"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Weather Monitoring"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Education & Research "
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Tech demonstration"
            link="#"
          />
          <Card
            image="/images/EO.gif"
            name="Scientific Research"
            link="#"
          />
          
        </div>
      </main>
    </div>
  );
};

export default services;
 */

import React, { useEffect, useState } from 'react';
import Card from '../components/Common/Card';

const Services: React.FC = () => {
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3005/satellites'); // Fetch the satellites data
        const data = await response.json();
        
        // Transform the data into an array of categories
        const categoryArray = Object.keys(data).map((key) => ({
          name: key,
          image: data[key].image || '/images/EO.gif', // Use the image from the category or a default image
        }));
        
        setCategories(categoryArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div className=" flex flex-col w-full h-full ">
      <main className="bg-black text-white p-2 h-full flex flex-col">
        <h1 className="text-2xl font-mono mb-6">What's the purpose of Your Project?</h1>

        <p className="font-mono text-sm mb-8">
          Select the purpose of your project from the options listed below. It helps us provide the best options.
        </p>

        <div className=" grid grid-cols-5 grid-rows-2 gap-2 h-full">
          {categories.map((category) => (
            <Card 
              key={category.name}
              image={category.image}
              name={category.name}
              link={`/satinfo/${category.name}`} // Link to the SatInfo page with the category name
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Services;
