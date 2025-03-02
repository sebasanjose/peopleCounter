export interface CountEvent {
  timestamp: string | number;
  count: number;
  previous_count: number;
  frame?: number;
}

export interface VideoFeedProps {
  mode: 'webcam' | 'upload';
  videoFile?: string;
  onCountUpdate: (count: number) => void;
  onEventsUpdate: (events: CountEvent[]) => void;
  onFrameUpdate?: (frame: number) => void;
  onTotalFramesUpdate?: (frames: number) => void;
  currentFrame?: number;
  isPlaying?: boolean;
}

export interface CountDisplayProps {
  count: number;
}

export interface TimelineProps {
  events: CountEvent[];
  totalFrames: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
}

export interface UploadFormProps {
  onVideoUpload: (filename: string) => void;
}

export interface WebSocketMessage {
  type: string;
  frame?: string;
  count?: number;
  events?: CountEvent[];
  frame_number?: number;
  total_frames?: number;
  error?: string;
} 