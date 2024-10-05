import React from 'react'

export function SatelliteModel(props: any) {
  return (
    <div {...props}>
      <img 
        src="/images/satellite.png" 
        alt="Satellite" 
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}
