import React from 'react';

interface TableProps {
  data: {
    label: string;
    values: string | string[]; // Updated to allow string or array of strings
  }[];
}

const SatelliteTable: React.FC<TableProps> = ({ data }) => {
  return (
    <div>
      {data.map((item, index) => (
        <div key={index} className="mb-1 ">
          <table className="w-full border-collapse border border-gray-300 rounded-sm"> {/* Added rounded class */}
            <thead>
              <tr>
                <th colSpan={item.values.length} className="border border-gray-300 p-px text-center">{item.label.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              <tr  className='font-mono'>
                {Array.isArray(item.values) ? (
                  item.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="border border-gray-300 p-px text-center" style={{ width: '25%' }}>{value.toUpperCase()}</td> // Fixed width for 4 columns
                  ))
                ) : (
                  item.label === 'Applications' && item.values.includes(',') ? ( // Check for 'applications' and comma
                    <td className="border border-gray-300 p-px text-center" style={{ width: '100%' }}>{item.values.trim().toUpperCase()}</td> // Treat as a complete sentence
                  ) : (
                    item.values.split(',').map((value, valueIndex) => (
                      <td key={valueIndex} className="border border-gray-300 p-px text-center" style={{ width: '20%' }}>{value.trim().toUpperCase()}</td> // Fixed width for 3 columns
                    ))
                  )
                )}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SatelliteTable;
