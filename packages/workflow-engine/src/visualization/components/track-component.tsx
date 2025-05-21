import React from 'react';
import { Track, TrackId } from '../../core/types';

export interface TrackComponentProps {
  track: Track;
  selected: boolean;
  onClick: (trackId: TrackId, e: React.MouseEvent) => void;
  onDelete: (trackId: TrackId) => void;
  readOnly: boolean;
}

/**
 * Component for rendering a workflow track
 */
export const TrackComponent: React.FC<TrackComponentProps> = ({
  track,
  selected,
  onClick,
  onDelete,
  readOnly
}) => {
  // Handle track click
  const handleClick = (e: React.MouseEvent) => {
    onClick(track.id, e);
  };

  // Handle track deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(track.id);
  };

  return (
    <div
      className={`workflow-track ${selected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: '20px',
        top: `${track.nodeIds.length > 0 ? 20 : 20}px`,
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        borderRadius: '5px',
        padding: '10px',
        border: selected ? '2px solid #000' : '1px solid #ccc',
        cursor: 'default',
        minWidth: '200px',
        zIndex: 0
      }}
      onClick={handleClick}
    >
      <div className="track-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span className="track-name" style={{ fontWeight: 'bold' }}>
          {track.name}
        </span>
        
        {!readOnly && (
          <button
            className="delete-button"
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        )}
      </div>
      
      {track.description && (
        <div className="track-description" style={{ fontSize: '12px', color: '#666' }}>
          {track.description}
        </div>
      )}
    </div>
  );
};

