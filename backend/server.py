import os
import cv2
import numpy as np
import base64
import json
import time
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import uvicorn
from ultralytics import YOLO
import asyncio
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO("yolov8n.pt")

# Store for count events
count_events = []
current_count = 0
connected_clients = set()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "People Counter API is running"}

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    # Save the uploaded video to a temporary file
    temp_file = f"temp_{int(time.time())}.mp4"
    with open(temp_file, "wb") as buffer:
        buffer.write(await file.read())
    
    # Process the video and return the path
    return {"filename": temp_file}

@app.get("/count-events")
async def get_count_events():
    global count_events
    return {"events": count_events}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global count_events, current_count
    
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            
            if data["type"] == "frame":
                # Process the frame for people detection
                frame_data = data["frame"].split(",")[1]
                img_bytes = base64.b64decode(frame_data)
                nparr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Run YOLO detection
                results = model(frame, classes=0)  # Class 0 is person in COCO dataset
                
                # Count people
                person_count = len(results[0].boxes)
                
                # Check if count changed
                if person_count != current_count:
                    timestamp = datetime.now().isoformat()
                    count_events.append({
                        "timestamp": timestamp,
                        "count": person_count,
                        "previous_count": current_count
                    })
                    current_count = person_count
                
                # Draw bounding boxes
                annotated_frame = results[0].plot()
                
                # Convert back to base64 for sending to client
                _, buffer = cv2.imencode('.jpg', annotated_frame)
                img_str = base64.b64encode(buffer).decode('utf-8')
                
                # Send the processed frame and count back to the client
                await websocket.send_json({
                    "type": "detection",
                    "frame": f"data:image/jpeg;base64,{img_str}",
                    "count": person_count,
                    "events": count_events[-10:] if count_events else []  # Send the last 10 events
                })
            
            elif data["type"] == "video_file":
                # Process a video file
                filename = data["filename"]
                if not os.path.exists(filename):
                    await websocket.send_json({"error": "File not found"})
                    continue
                
                cap = cv2.VideoCapture(filename)
                frame_count = 0
                
                # Reset count events for new video
                count_events = []
                current_count = 0
                
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    
                    # Process every 5th frame to improve performance
                    if frame_count % 5 == 0:
                        # Run YOLO detection
                        results = model(frame, classes=0)
                        
                        # Count people
                        person_count = len(results[0].boxes)
                        
                        # Check if count changed
                        if person_count != current_count:
                            # Get timestamp based on video frame
                            fps = cap.get(cv2.CAP_PROP_FPS)
                            timestamp = frame_count / fps
                            count_events.append({
                                "timestamp": timestamp,
                                "frame": frame_count,
                                "count": person_count,
                                "previous_count": current_count
                            })
                            current_count = person_count
                        
                        # Draw bounding boxes
                        annotated_frame = results[0].plot()
                        
                        # Convert to base64 for sending to client
                        _, buffer = cv2.imencode('.jpg', annotated_frame)
                        img_str = base64.b64encode(buffer).decode('utf-8')
                        
                        # Send the processed frame and count back to the client
                        await websocket.send_json({
                            "type": "detection",
                            "frame": f"data:image/jpeg;base64,{img_str}",
                            "count": person_count,
                            "frame_number": frame_count,
                            "events": count_events[-10:] if count_events else []
                        })
                    
                    frame_count += 1
                
                cap.release()
                
                # Send complete event list after processing
                await websocket.send_json({
                    "type": "complete",
                    "events": count_events,
                    "total_frames": frame_count
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    # Download YOLO model if not already downloaded
    if not os.path.exists("yolov8n.pt"):
        model.download()
    
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True) 