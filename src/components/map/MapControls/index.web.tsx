import React from 'react';
// Using 'feather-icons-react' for web as it's a more standard web package
import FeatherIcon from 'feather-icons-react';

export type MapType = 'standard' | 'satellite' | 'hybrid';

interface MapControlsProps {
  mapType: MapType;
  onRecenter: () => void;
  onToggleMapType: () => void;
  onOpenInMaps: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  onRecenter,
  onToggleMapType,
  onOpenInMaps
}) => {
  const getMapTypeIcon = () => {
    switch (mapType) {
      case 'standard':
        return 'layers';
      case 'satellite':
        return 'map';
      default:
        return 'map';
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px',
    margin: '4px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 0, // Align icon properly
  };

  return (
    <div style={containerStyle}>
      <button onClick={onRecenter} style={buttonStyle} title="Recenter">
        <FeatherIcon icon="crosshair" size={22} color="#333" />
      </button>
      <button onClick={onToggleMapType} style={buttonStyle} title="Toggle map type">
        <FeatherIcon icon={getMapTypeIcon()} size={22} color="#333" />
      </button>
      <button onClick={onOpenInMaps} style={buttonStyle} title="Open in Google Maps">
        <FeatherIcon icon="navigation" size={22} color="#333" />
      </button>
    </div>
  );
};

export default MapControls;
