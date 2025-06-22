# LlamaProctor

A macOS application that monitors student activity during class using AI analysis and stores the data in MongoDB. The app automatically retrieves assignments from teachers and analyzes student screen activity in real-time.

## Features

### Core Functionality
- **Real-time screen capture** using ScreenCaptureKit (every 10 seconds)
- **AI-powered activity monitoring** using Llama-4-Scout-17B-16E-Instruct-FP8
- **Automatic assignment retrieval** from MongoDB (every 5 seconds)
- **Image optimization** - scales screenshots to 720p for faster AI inference
- **Focus score tracking** with intelligent scoring algorithm
- **Active/inactive status tracking** with automatic updates

### AI Analysis Features
- **4-field analysis**:
  - Score (0-5) for on-task behavior
  - Description (1-sentence summary of student activity)
  - Short Description (3-word max summary)
  - Suggestion for teacher (on-task/sussy/needs reminder)
- **Color-coded UI** for quick status assessment
- **Context-aware analysis** considering active windows and screen content

## MongoDB Integration

The app uses two MongoDB collections:

### 1. Student Activity Collection: `LlamaProctorDB.students`
Each document contains comprehensive student data:

```json
{
  "id": "1",
  "name": "Kevin",
  "focusScore": 8,
  "description": "Student is working on math problems in Google Docs",
  "shortDescription": "Math homework",
  "suggestion": "on-task",
  "history": [
    "Working on math problems",
    "Reading assignment instructions",
    "Taking notes in notebook app"
  ],
  "screenshot": "base64_encoded_image_data",
  "classroom": "1",
  "active": true,
  "lastUpdated": "2025-06-22T10:30:00Z"
}
```

### 2. Teacher Assignments Collection: `LlamaProctorDB.assignments`
Teachers can set assignments that students automatically receive:

```json
{
  "description": "Watch MrBeast",
  "classroom": "1"
}
```

### Focus Score Algorithm

The focus score (0-5) is dynamically updated based on Llama AI analysis:
- **Llama score ≤ 2**: Decrease focus score by 1 (minimum 0) 
- **Llama score ≥ 4**: Increase focus score by 1 (maximum 5)
- **Llama score = 3**: Keep focus score unchanged
- **Initial score**: 5 for new students

### History Tracking
- Maintains rolling history of last 60 student activities
- Stores full descriptions for pattern analysis
- Automatically managed with newest entries first

## Setup

### Prerequisites
- macOS 13.0+ (for ScreenCaptureKit support)
- Xcode 14.0+
- MongoDB Atlas account or local MongoDB instance

### Configuration

1. **Copy and configure the config file:**
   ```bash
   cp Config.template.swift LlamaProctor/Config.swift
   ```

2. **Update MongoDB connection in `LlamaProctor/Config.swift`:**
   ```swift
   struct Config {
       static let mongoDBURI = "your_mongodb_connection_string_here"
   }
   ```

3. **Set up MongoDB collections:**
   - Create database: `LlamaProctorDB`
   - Create collections: `students` and `assignments`
   - Add initial assignment document for testing

### Building and Running

1. Open `LlamaProctor.xcodeproj` in Xcode
2. Build and run the project (⌘+R)
3. **Grant screen recording permissions** when prompted:
   - System Settings → Privacy & Security → Screen Recording
   - Enable for LlamaProctor
4. The app automatically starts monitoring once permissions are granted

## Current Implementation Status

### ✅ Completed Features
- MongoDB integration with real CRUD operations
- Automatic assignment retrieval from teachers
- Real-time screen capture and AI analysis  
- Focus score calculation and history tracking
- Screenshot storage with base64 encoding
- Active/inactive status management
- Secure credential management
- Image scaling for optimized AI inference
- Color-coded UI with 4-field analysis display

### 🔄 Real-time Operations
- **Screenshot capture**: Every 10 seconds
- **Window detection**: Every 1 second  
- **Assignment sync**: Every 5 seconds
- **AI analysis**: Triggered after each screenshot (when assignment exists)
- **MongoDB updates**: After each successful AI analysis

## Architecture

### Core Components
1. **StreamManager**: Handles screen capture using ScreenCaptureKit
2. **MongoDBService**: Manages all database operations
3. **ContentView**: Main UI and coordination logic
4. **AI Integration**: Direct API calls to Llama service

### Data Flow
1. Teacher sets assignment in MongoDB
2. Student app retrieves assignment every 5 seconds
3. App captures screenshot every 10 seconds  
4. Screenshot sent to Llama AI for analysis
5. AI response parsed and stored in MongoDB
6. UI updated with latest analysis and focus score

## Privacy and Security

- **Local processing**: Screenshots analyzed via API, not stored permanently
- **Secure credentials**: MongoDB URI stored in gitignored Config.swift
- **Base64 encoding**: Screenshots stored efficiently in database
- **Permission-based**: Requires explicit screen recording permission
- **Masked logging**: Database credentials masked in console output

## Teacher Dashboard Requirements

To fully utilize the system, teachers need to:
1. Access MongoDB to set assignments in the `assignments` collection
2. Monitor student data in the `students` collection  
3. Use classroom field to manage multiple classes

Example assignment creation:
```javascript
db.assignments.replaceOne(
  { classroom: "1" },
  { description: "Complete Chapter 5 math exercises", classroom: "1" },
  { upsert: true }
)
```