# LlamaProctor - AI-Powered Classroom Monitoring System

A comprehensive classroom monitoring solution that uses AI to analyze student screen activity in real-time. The system consists of a macOS student client app and a web-based teacher dashboard, connected through MongoDB for seamless data synchronization.

## 🎯 Overview

LlamaProctor combines real-time screen capture, AI analysis, and intuitive teacher tools to create a modern classroom monitoring experience. Teachers can set assignments, monitor student progress, and receive intelligent insights about student engagement and focus levels.

## 🏗️ System Architecture

### Student Client (macOS App)
- **Real-time screen capture** using ScreenCaptureKit (every 10 seconds)
- **AI-powered analysis** using Llama-4-Scout-17B-16E-Instruct-FP8
- **Automatic assignment sync** from MongoDB (every 5 seconds)
- **Focus score tracking** with intelligent scoring algorithm
- **Screenshot storage** with base64 encoding for teacher review

### Teacher Dashboard (Next.js Web App)
- **Real-time student monitoring** with live activity updates
- **Assignment management** with instant distribution to all students
- **AI chat assistant** (Sussi AI) for classroom insights
- **Student status indicators** (On-Task, Suspicious, Needs Help)
- **Multiple view modes** (Grid and Heatmap)
- **Automation rules** for proactive student management

### Data Layer (MongoDB)
- **Centralized data storage** for students, assignments, and messages
- **Real-time synchronization** between student apps and teacher dashboard
- **Scalable classroom management** with multi-class support

## 📱 Student Client Features

### Core Functionality
- **Intelligent Screen Analysis**: 4-field AI analysis including focus score (0-5), activity description, 3-word summary, and teacher suggestions
- **Privacy-First Design**: Local processing with secure API calls, no permanent screenshot storage
- **Dynamic Focus Scoring**: Adaptive algorithm that tracks student engagement over time
- **Window Detection**: Context-aware analysis considering active applications
- **Assignment Integration**: Automatic retrieval and display of teacher assignments

### User Interface
- **Color-coded status indicators**: Green (on-task), Orange (suspicious), Red (needs help)
- **Real-time feedback**: Live display of AI analysis and current assignment
- **Minimal system impact**: Efficient screen capture with optimized API calls

## 🖥️ Teacher Dashboard Features

### Student Management
- **Live Activity Grid**: Real-time view of all student screens and activities
- **Individual Student Cards**: Detailed view with screenshots, status, and activity history
- **Student Chat**: Direct communication with Sussi AI about specific students
- **Classroom Chat**: AI assistant for overall classroom management

### Assignment & Instruction Management
- **Dynamic Assignment Distribution**: Set and update assignments instantly across all students
- **Flag Summary**: Automatic detection of students not following instructions
- **Progress Monitoring**: Real-time updates on student compliance and engagement

### Advanced Features
- **Automation Rules**: Set up triggers for common classroom scenarios
- **Multiple View Modes**: Switch between detailed grid and classroom heatmap views
- **Message System**: Send targeted messages to individual students
- **Mock Data Support**: Built-in demo mode for testing and training

## 🔧 Technology Stack

### Student Client
- **Platform**: macOS 13.0+ (Swift/SwiftUI)
- **Screen Capture**: ScreenCaptureKit framework
- **Database**: MongoDB with MongoSwiftSync driver
- **AI Integration**: Direct API calls to Llama service
- **Image Processing**: Base64 encoding with 720p optimization

### Teacher Dashboard
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with official Node.js driver
- **State Management**: React hooks
- **UI Components**: Custom components with modern design

## 🚀 Getting Started

### Prerequisites
- macOS 13.0+ (for student client)
- Node.js 18+ (for teacher dashboard)
- MongoDB Atlas account or local MongoDB instance

### Student Client Setup
1. **Configure MongoDB connection:**
   ```bash
   cd LlamaStudentClient
   cp Config.template.swift LlamaProctor/Config.swift
   # Edit Config.swift with your MongoDB connection string
   ```

2. **Build and run:**
   - Open `LlamaProctor.xcodeproj` in Xcode
   - Build and run the project (⌘+R)
   - Grant screen recording permissions when prompted

### Teacher Dashboard Setup
1. **Install dependencies:**
   ```bash
   cd teacher
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Create .env.local file with:
   MONGODB_URI=your_mongodb_connection_string
   LLAMA_API_KEY=your_llama_api_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup
Create the following collections in MongoDB:
- `LlamaProctorDB.students` - Student activity data
- `LlamaProctorDB.assignments` - Teacher assignments
- `LlamaProctorDB.messages` - Student-teacher messages

## 📊 Data Flow

1. **Assignment Creation**: Teachers set assignments through the web dashboard
2. **Assignment Sync**: Student apps retrieve assignments every 5 seconds
3. **Screen Capture**: Student apps capture screenshots every 10 seconds
4. **AI Analysis**: Screenshots analyzed by Llama AI for activity assessment
5. **Data Storage**: Analysis results stored in MongoDB with focus scores
6. **Teacher Updates**: Dashboard displays real-time student activity and insights

## 🛡️ Privacy & Security

- **Local Processing**: Screenshots analyzed via API, not stored permanently on devices
- **Secure Credentials**: MongoDB URI and API keys stored in gitignored config files
- **Permission-Based**: Requires explicit screen recording permission from students
- **Encrypted Transport**: All data transmission uses HTTPS/TLS encryption
- **Masked Logging**: Sensitive credentials automatically masked in console output

## 🎓 Use Cases

- **Classroom Management**: Real-time monitoring of student engagement and focus
- **Remote Learning**: Ensure students stay on task during online classes
- **Assessment Integrity**: Monitor student activities during digital assessments
- **Behavior Analytics**: Track patterns in student engagement over time
- **Intervention Alerts**: Automated notifications when students need assistance

## 🔮 Future Enhancements

- **Multi-platform Support**: Windows and Linux student clients
- **Advanced Analytics**: Detailed engagement reports and trends
- **Integration APIs**: Connect with popular LMS platforms
- **Mobile Dashboard**: iOS/Android apps for teachers
- **Voice Commands**: Hands-free classroom management
- **Parent Portal**: Optional parent access to student progress

## 📄 License

This project is part of an educational monitoring system designed for classroom use. Please ensure compliance with local privacy laws and institutional policies before deployment.
