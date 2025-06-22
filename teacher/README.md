# Classroom Monitor - Teacher Dashboard

A real-time classroom monitoring dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Instruction Management
- **Instruction Input Panel**: Teachers can set and update expected activities for students
- Real-time instruction display with current activity tracking

### 👥 Student Management
- **Add Student Panel**: Add students to the monitoring dashboard using student IDs
- Mock database integration with simulated API calls (500ms delay)
- Duplicate student prevention with error handling

### 📊 Real-time Monitoring
- **Student Screen Grid**: Responsive grid view showing all connected students
- **Individual Student Cards**: Display student name, screenshot, activity status, and last update time
- **Status Indicators**: Green border for on-task students, red border for off-task students
- **Activity Tracking**: Real-time updates every 10 seconds with simulated activity changes

### 🚨 Flag Summary
- **Flag Summary Panel**: Scrollable list of students not matching the current instruction
- **Detailed Mismatch Information**: Shows expected vs. current activity for flagged students
- **Success State**: Displays checkmark when all students are on task

### 🔄 View Toggle
- **Grid View**: Traditional card-based layout for detailed student monitoring
- **Heatmap View**: Mock classroom seating arrangement with color-coded status indicators

### 🎨 User Experience
- **Toast Notifications**: Success and error messages for user actions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS styling

## Mock Data

The application includes a mock student database with 6 sample students:

- **stu001**: Alex Johnson
- **stu002**: Sarah Chen  
- **stu003**: Michael Rodriguez
- **stu004**: Emily Davis
- **stu005**: David Kim
- **stu006**: Lisa Wang

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
```bash
npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

## Usage

1. **Set Expected Activity**: Use the instruction panel to set what students should be doing
2. **Add Students**: Enter student IDs (stu001-stu006) to add them to the dashboard
3. **Monitor Activity**: Watch real-time updates of student activities and status
4. **View Flags**: Check the flag summary panel for students not following instructions
5. **Toggle Views**: Switch between grid and heatmap views using the view toggle

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React useState and useEffect
- **Mock Backend**: In-memory data with simulated API delays

## Project Structure

```
src/app/
├── components/
│   ├── InstructionPanel.tsx      # Instruction input and display
│   ├── AddStudentPanel.tsx       # Student addition with mock API
│   ├── StudentCard.tsx           # Individual student display
│   ├── StudentGrid.tsx           # Grid layout for students
│   ├── HeatmapView.tsx           # Mock heatmap view
│   ├── FlagSummaryPanel.tsx      # Off-task student summary
│   ├── ViewToggle.tsx            # Grid/Heatmap toggle
│   └── Toast.tsx                 # Notification component
├── types.ts                      # TypeScript interfaces
├── mockData.ts                   # Mock database and utilities
├── page.tsx                      # Main dashboard component
├── layout.tsx                    # Root layout
└── globals.css                   # Global styles
```

## Future Enhancements

- Real backend integration
- WebSocket support for live updates
- Student authentication
- Activity analytics and reporting
- Custom instruction templates
- Export functionality for reports
