import React, { useRef, useEffect } from 'react';
import { TimelineProps, CountEvent } from '../types';

const Timeline: React.FC<TimelineProps> = ({ events, totalFrames, currentFrame, onSeek }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Calculate position for markers based on frame number
  const calculateMarkerPosition = (frame: number) => {
    return (frame / totalFrames) * 100;
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentage = clickPosition / rect.width;
      const frame = Math.floor(percentage * totalFrames);
      onSeek(frame);
    }
  };
  
  // Update the position of the current frame marker
  useEffect(() => {
    const marker = document.getElementById('current-frame-marker');
    if (marker) {
      marker.style.left = `${calculateMarkerPosition(currentFrame)}%`;
    }
  }, [currentFrame]);
  
  return (
    <div className="w-full">
      {/* Timeline bar */}
      <div 
        ref={timelineRef}
        className="relative h-8 bg-gray-200 rounded-full cursor-pointer mb-4"
        onClick={handleTimelineClick}
      >
        {/* Event markers */}
        {events.map((event, index) => (
          event.frame !== undefined && (
            <div 
              key={index}
              className="absolute w-2 h-6 bg-secondary rounded-full transform -translate-x-1/2 top-1"
              style={{ left: `${calculateMarkerPosition(event.frame)}%` }}
              title={`Count: ${event.count} at frame ${event.frame}`}
            />
          )
        ))}
        
        {/* Current position marker */}
        <div 
          id="current-frame-marker"
          className="absolute w-3 h-8 bg-primary rounded-full transform -translate-x-1/2 top-0"
          style={{ left: `${calculateMarkerPosition(currentFrame)}%` }}
        />
        
        {/* Progress bar */}
        <div 
          className="absolute h-8 bg-primary bg-opacity-30 rounded-l-full top-0 left-0"
          style={{ width: `${calculateMarkerPosition(currentFrame)}%` }}
        />
      </div>
      
      {/* Timeline info */}
      <div className="flex justify-between text-sm text-gray-500">
        <div>Frame: {currentFrame} / {totalFrames}</div>
        <div>
          {totalFrames > 0 && (
            <>
              Time: {formatTime((currentFrame / totalFrames) * (totalFrames / 30))} / 
              {formatTime(totalFrames / 30)}
            </>
          )}
        </div>
      </div>
      
      {/* Event list */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Count Events</h3>
        <div className="flex flex-wrap gap-2">
          {events.map((event, index) => (
            event.frame !== undefined && (
              <button
                key={index}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                onClick={() => onSeek(event.frame as number)}
              >
                Count: {event.count} at {formatTime((event.frame as number) / 30)}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 