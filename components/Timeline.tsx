import React, { useRef, useEffect, useState } from 'react';
import { TimelineProps, CountEvent } from '../types';

const Timeline: React.FC<TimelineProps> = ({ events, totalFrames, currentFrame, onSeek }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'count' | 'total'>('all');
  const [targetCount, setTargetCount] = useState<number | null>(null);
  
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

  // Find frame with specific count
  const findFrameWithCount = (targetValue: number, isTotal: boolean = false) => {
    if (!events.length) return;
    
    const property = isTotal ? 'total_count' : 'count';
    
    // Find the first event that matches or exceeds the target count
    const event = events.find(e => e[property] >= targetValue);
    
    if (event && event.frame !== undefined) {
      onSeek(event.frame);
      return true;
    }
    
    return false;
  };
  
  // Handle count search
  const handleCountSearch = () => {
    if (targetCount === null) return;
    
    const found = findFrameWithCount(targetCount, filterMode === 'total');
    
    if (!found) {
      alert(`No frame found with ${filterMode === 'total' ? 'total' : 'current'} count of ${targetCount}`);
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
              className={`absolute w-2 h-6 rounded-full transform -translate-x-1/2 top-1 ${
                filterMode === 'all' ? 'bg-secondary' : 
                filterMode === 'count' ? (event.count > event.previous_count ? 'bg-green-500' : 'bg-red-500') :
                'bg-purple-500'
              }`}
              style={{ left: `${calculateMarkerPosition(event.frame)}%` }}
              title={`Count: ${event.count}, Total: ${event.total_count} at frame ${event.frame}`}
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
      
      {/* Count search */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Find by Count</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select 
            className="px-3 py-2 border rounded-md"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'all' | 'count' | 'total')}
          >
            <option value="count">Current Count</option>
            <option value="total">Total Count</option>
          </select>
          <input 
            type="number" 
            min="0"
            placeholder="Enter count value"
            className="flex-1 px-3 py-2 border rounded-md"
            onChange={(e) => setTargetCount(e.target.value ? parseInt(e.target.value) : null)}
            onKeyDown={(e) => e.key === 'Enter' && handleCountSearch()}
          />
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={handleCountSearch}
          >
            Find
          </button>
        </div>
      </div>
      
      {/* Event list */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Count Events</h3>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm ${filterMode === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              onClick={() => setFilterMode('all')}
            >
              All Events
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${filterMode === 'count' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              onClick={() => setFilterMode('count')}
            >
              Current Count
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${filterMode === 'total' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              onClick={() => setFilterMode('total')}
            >
              Total Count
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {events
            .filter(event => event.frame !== undefined)
            .map((event, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterMode === 'all' ? 'bg-gray-100 hover:bg-gray-200' : 
                  filterMode === 'count' ? (event.count > event.previous_count ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200') :
                  'bg-purple-100 hover:bg-purple-200'
                }`}
                onClick={() => onSeek(event.frame as number)}
              >
                {filterMode === 'all' || filterMode === 'count' ? `Count: ${event.count}` : `Total: ${event.total_count}`} at {formatTime((event.frame as number) / 30)}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 