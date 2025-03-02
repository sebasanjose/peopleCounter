import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { VideoFeedProps, WebSocketMessage, CountEvent } from '../types';

const VideoFeed: React.FC<VideoFeedProps> = ({
  mode,
  videoFile,
  onCountUpdate,
  onEventsUpdate,
  onFrameUpdate,
  onTotalFramesUpdate,
  currentFrame,
  isPlaying
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket server
  useEffect(() => {
    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new WebSocket connection
    const socket = new WebSocket('ws://localhost:8000/ws');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'detection') {
          // Update the processed image
          if (data.frame) {
            setProcessedImage(data.frame);
          }
          
          // Update the count
          if (data.count !== undefined) {
            onCountUpdate(data.count);
          }
          
          // Update events
          if (data.events) {
            onEventsUpdate(data.events as CountEvent[]);
          }
          
          // Update current frame for video mode
          if (data.frame_number !== undefined && onFrameUpdate) {
            onFrameUpdate(data.frame_number);
          }
        } else if (data.type === 'complete') {
          // Processing complete for video file
          if (data.events) {
            onEventsUpdate(data.events as CountEvent[]);
          }
          
          if (data.total_frames !== undefined && onTotalFramesUpdate) {
            onTotalFramesUpdate(data.total_frames);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, videoFile]);

  // Handle webcam mode
  useEffect(() => {
    if (mode === 'webcam' && isConnected) {
      // Start sending frames from webcam
      intervalRef.current = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'frame',
              frame: imageSrc
            }));
          }
        }
      }, 100); // Send frame every 100ms
    } else if (intervalRef.current) {
      // Clear interval if not in webcam mode
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, isConnected]);

  // Handle video file mode
  useEffect(() => {
    if (mode === 'upload' && videoFile && isConnected && socketRef.current) {
      // Send video file for processing
      socketRef.current.send(JSON.stringify({
        type: 'video_file',
        filename: videoFile
      }));
    }
  }, [mode, videoFile, isConnected]);

  // Handle seeking in video mode
  useEffect(() => {
    if (mode === 'upload' && isConnected && socketRef.current && currentFrame !== undefined) {
      // Send seek command to server
      socketRef.current.send(JSON.stringify({
        type: 'seek',
        frame: currentFrame
      }));
    }
  }, [currentFrame, mode, isConnected]);

  // Handle play/pause in video mode
  useEffect(() => {
    if (mode === 'upload' && isConnected && socketRef.current && isPlaying !== undefined) {
      // Send play/pause command to server
      socketRef.current.send(JSON.stringify({
        type: isPlaying ? 'play' : 'pause'
      }));
    }
  }, [isPlaying, mode, isConnected]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {mode === 'webcam' && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {processedImage && (
        <img 
          src={processedImage} 
          alt="Processed video feed" 
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
          <p className="text-xl">Connecting to server...</p>
        </div>
      )}
    </div>
  );
};

export default VideoFeed; 