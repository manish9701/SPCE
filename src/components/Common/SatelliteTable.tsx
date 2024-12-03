import React from 'react';

interface TableProps {
  data: {
    label: string;
    values: string | string[];
  }[];
}

const SatelliteTable: React.FC<TableProps> = ({ data }) => {
  return (
    <div>{data.map((item, index) => (
      <div key={index} className="mb-1">
        <table className="w-full border-collapse border border-gray-200 rounded-sm">
          <thead>
            <tr>
              <th colSpan={item.values.length} 
                  className="border border-gray-200 p-px text-center text-zinc-800 font-medium bg-gray-50"
              >
                {item.label.toUpperCase()}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className='font-mono text-zinc-500'>
              {Array.isArray(item.values) 
                ? item.values.map((value, valueIndex) => (
                  <td key={valueIndex} 
                      className="border border-gray-200 p-px text-center" 
                      style={{ width: '25%' }}
                  >
                    {value.toUpperCase()}
                  </td>
                ))
                : item.label === 'Applications' && item.values.includes(',')
                  ? <td className="border border-gray-200 p-px text-center" 
                        style={{ width: '100%' }}
                    >
                      {item.values.trim().toUpperCase()}
                    </td>
                  : item.values.split(',').map((value, valueIndex) => (
                    <td key={valueIndex} 
                        className="border border-gray-200 p-px text-center" 
                        style={{ width: '20%' }}
                    >
                      {value.trim().toUpperCase()}
                    </td>
                  ))
              }</tr>
          </tbody>
        </table>
      </div>
    ))}</div>
  );
};

export default SatelliteTable;
