import React, { useEffect, useState } from 'react';
import Card from '../components/Common/Card';

const Services: React.FC = () => {
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3005/satellites')
      .then(response => response.json())
      .then(data => {
        const categoryArray = Object.keys(data).map(key => ({
          name: key,
          image: data[key].image || '/images/EO.gif',
        }));
        setCategories(categoryArray);
      })
      .catch(error => console.error('Error fetching categories:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full h-full">
      <main className="bg-black text-white p-2 h-full flex flex-col">
        <h1 className="text-2xl font-mono mb-4">Discover Your Perfect Satellite Solution</h1>
        <p className="font-mono text-sm mb-4">
          Tell us about your mission, and we'll guide you to the optimal satellite configuration.
        </p>
        <div className="grid grid-cols-5 grid-rows-2 gap-2 h-full">
          {categories.map(({ name, image }) => (
            <div 
              key={name} 
              className="transform transition-all duration-300 hover:scale-105 "
            >
              <Card 
                image={image}
                name={name}
                link={`/satinfo/${name}`}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Services;
