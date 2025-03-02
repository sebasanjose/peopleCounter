import { useState, useEffect } from 'react';
import Head from 'next/head';
import VideoFeed from '../components/VideoFeed';
import CountDisplay from '../components/CountDisplay';
import Timeline from '../components/Timeline';
import UploadForm from '../components/UploadForm';
import { CountEvent } from '../types';

export default function Home() {
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [countEvents, setCountEvents] = useState<CountEvent[]>([]);
  const [videoMode, setVideoMode] = useState<'webcam' | 'upload'>('webcam');
  const [uploadedVideoFile, setUploadedVideoFile] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleCountUpdate = (count: number) => {
    setCurrentCount(count);
  };

  const handleEventsUpdate = (events: CountEvent[]) => {
    setCountEvents(events);
  };

  const handleVideoUpload = (filename: string) => {
    setUploadedVideoFile(filename);
    setVideoMode('upload');
  };

  const handleFrameUpdate = (frame: number) => {
    setCurrentFrame(frame);
  };

  const handleTotalFramesUpdate = (frames: number) => {
    setTotalFrames(frames);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeekToCount = (count: number) => {
    // Find the first event with the specified count
    const event = countEvents.find(e => e.count === count);
    if (event && event.frame !== undefined) {
      setCurrentFrame(event.frame);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>People Counter SaaS</title>
        <meta name="description" content="Real-time people counting using computer vision" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-text">People Counter SaaS</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Feed */}
          <div className="lg:col-span-2 bg-card rounded-lg shadow-lg p-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-text">Video Feed</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setVideoMode('webcam')}
                  className={`px-4 py-2 rounded-md ${videoMode === 'webcam' ? 'bg-primary text-white' : 'bg-gray-200 text-text'}`}
                >
                  Webcam
                </button>
                <button 
                  onClick={() => setVideoMode('upload')}
                  className={`px-4 py-2 rounded-md ${videoMode === 'upload' ? 'bg-primary text-white' : 'bg-gray-200 text-text'}`}
                >
                  Upload Video
                </button>
              </div>
            </div>
            
            {videoMode === 'webcam' ? (
              <VideoFeed 
                mode="webcam"
                onCountUpdate={handleCountUpdate}
                onEventsUpdate={handleEventsUpdate}
              />
            ) : (
              <>
                {!uploadedVideoFile ? (
                  <UploadForm onVideoUpload={handleVideoUpload} />
                ) : (
                  <VideoFeed 
                    mode="upload"
                    videoFile={uploadedVideoFile}
                    onCountUpdate={handleCountUpdate}
                    onEventsUpdate={handleEventsUpdate}
                    onFrameUpdate={handleFrameUpdate}
                    onTotalFramesUpdate={handleTotalFramesUpdate}
                    currentFrame={currentFrame}
                    isPlaying={isPlaying}
                  />
                )}
              </>
            )}
            
            {videoMode === 'upload' && uploadedVideoFile && (
              <div className="mt-4 flex justify-center space-x-4">
                <button 
                  onClick={handlePlayPause}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            )}
          </div>
          
          {/* Right Column - Count Display and Controls */}
          <div className="space-y-8">
            <CountDisplay count={currentCount} />
            
            <div className="bg-card rounded-lg shadow-lg p-4">
              <h2 className="text-2xl font-semibold mb-4 text-text">Count History</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {countEvents.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>Count: {event.count}</span>
                    <span className="text-sm text-gray-500">
                      {typeof event.timestamp === 'string' 
                        ? new Date(event.timestamp).toLocaleTimeString() 
                        : `${event.timestamp.toFixed(2)}s`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-lg p-4">
              <h2 className="text-2xl font-semibold mb-4 text-text">Find Count</h2>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  min="0"
                  placeholder="Enter count number"
                  className="flex-1 px-4 py-2 border rounded-md"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSeekToCount(parseInt(e.target.value));
                    }
                  }}
                />
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-md"
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    if (input && input.value) {
                      handleSeekToCount(parseInt(input.value));
                    }
                  }}
                >
                  Find
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline Section */}
        {videoMode === 'upload' && uploadedVideoFile && totalFrames > 0 && (
          <div className="mt-8 bg-card rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 text-text">Timeline</h2>
            <Timeline 
              events={countEvents}
              totalFrames={totalFrames}
              currentFrame={currentFrame}
              onSeek={setCurrentFrame}
            />
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-gray-500">
        <p>People Counter SaaS - Powered by Computer Vision</p>
      </footer>
    </div>
  );
} 