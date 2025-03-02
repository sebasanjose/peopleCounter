# People Counter SaaS

A web-based Software-as-a-Service (SaaS) that uses computer vision to count people in video streams.

## Features

- Real-time people counting using computer vision
- Support for live webcam feeds and uploaded video files
- Interactive timeline to navigate to specific count events
- Dashboard with live count display and analytics
- Event logging with precise timestamps

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Python (FastAPI), OpenCV, YOLO
- **Real-time Communication**: Socket.IO

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/people-counter-saas.git
   cd people-counter-saas
   ```

2. Install frontend dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```
   # Start the Next.js frontend
   npm run dev
   # or
   yarn dev
   
   # In a separate terminal, start the Python backend
   python backend/server.py
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Connect a webcam or upload a video file
2. The system will automatically detect and count people
3. Use the timeline to navigate to specific count events
4. View real-time analytics on the dashboard

## License

MIT 