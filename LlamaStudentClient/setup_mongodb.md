# MongoDB Setup Guide for LlamaProctor

## Overview

LlamaProctor uses MongoDB to store student activity data and retrieve teacher assignments. The app requires two collections in the `LlamaProctorDB` database.

## Database Configuration

### Required Collections

1. **`students`** - Stores student activity analysis and focus scores
2. **`assignments`** - Stores teacher assignments for each classroom

### Connection Setup

The app uses the MongoDB connection string from `LlamaProctor/Config.swift`:

```swift
struct Config {
    static let mongoDBURI = "your_mongodb_connection_string_here"
}
```

**Note**: Copy `Config.template.swift` to `LlamaProctor/Config.swift` and update with your credentials.

## Database Schema

### Students Collection: `LlamaProctorDB.students`

```json
{
  "_id": ObjectId("..."),
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
  "lastUpdated": ISODate("2025-06-22T10:30:00.000Z")
}
```

#### Field Descriptions:
- **`id`**: Student identifier (string)
- **`name`**: Student name 
- **`focusScore`**: Focus score 0-5 (calculated from AI analysis)
- **`description`**: Full description from AI analysis
- **`shortDescription`**: 3-word summary from AI
- **`suggestion`**: Teacher action suggestion (on-task/sussy/needs reminder)
- **`history`**: Array of last 60 activity descriptions
- **`screenshot`**: Base64-encoded PNG screenshot
- **`classroom`**: Classroom identifier
- **`active`**: Whether app is currently running
- **`lastUpdated`**: Timestamp of last update

### Assignments Collection: `LlamaProctorDB.assignments`

```json
{
  "_id": ObjectId("..."),
  "description": "Watch MrBeast",
  "classroom": "1"
}
```

#### Field Descriptions:
- **`description`**: The assignment task students should work on
- **`classroom`**: Classroom identifier (unique per classroom)

## Setup Instructions

### Option 1: MongoDB Atlas (Recommended)

1. **Create Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster

2. **Configure Database Access**:
   - Create a database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

3. **Get Connection String**:
   - In Atlas dashboard, click "Connect" 
   - Choose "Connect your application"
   - Copy the connection string

4. **Update Config**:
   ```bash
   cp Config.template.swift LlamaProctor/Config.swift
   ```
   Replace the URI in `Config.swift` with your Atlas connection string.

### Option 2: Local MongoDB

1. **Install MongoDB**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **Update Config**:
   ```swift
   struct Config {
       static let mongoDBURI = "mongodb://localhost:27017"
   }
   ```

## Initial Data Setup

### Create Assignment for Testing

```javascript
// Connect to your MongoDB instance
use LlamaProctorDB

// Create initial assignment
db.assignments.replaceOne(
  { classroom: "1" },
  { 
    description: "Complete Chapter 5 math exercises",
    classroom: "1" 
  },
  { upsert: true }
)

// Verify assignment was created
db.assignments.find({ classroom: "1" })
```

### Example Assignment Updates

Teachers can update assignments by modifying the document:

```javascript
// Change assignment for classroom 1
db.assignments.replaceOne(
  { classroom: "1" },
  { 
    description: "Watch MrBeast video and take notes",
    classroom: "1" 
  }
)

// Create assignment for classroom 2
db.assignments.replaceOne(
  { classroom: "2" },
  { 
    description: "Research project on renewable energy",
    classroom: "2" 
  },
  { upsert: true }
)
```

## Monitoring and Testing

### Using MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Navigate to `LlamaProctorDB` database
4. Monitor both `students` and `assignments` collections

### Using Command Line

```bash
# Connect to MongoDB
mongosh "your_connection_string_here"

# Switch to LlamaProctor database
use LlamaProctorDB

# View current assignments
db.assignments.find()

# View student data
db.students.find()

# Check student activity history
db.students.find({}, { history: 1, focusScore: 1, active: 1 })

# Monitor real-time updates
db.students.find().sort({ lastUpdated: -1 }).limit(5)
```

### App Debugging

The app logs MongoDB operations with emojis for easy monitoring:

- **✅** Successful operations
- **❌** Error conditions  
- **📋** Assignment retrieval
- **💾** Data storage
- **🟢/🔴** App status changes

Watch the Xcode console for these indicators to verify proper operation.

## Data Management

### Focus Score Tracking

The focus score is automatically calculated:
- Starts at 5 for new students
- Decreases by 1 when AI scores ≤ 2 (off-task behavior)
- Increases by 1 when AI scores ≥ 4 (on-task behavior)  
- Stays same when AI scores = 3 (neutral behavior)
- Range: 0-5

### History Management

- Automatically maintains last 60 activity descriptions
- Newest entries added to beginning of array
- Older entries automatically removed
- Useful for identifying patterns in student behavior

### Screenshot Storage

- Screenshots stored as base64-encoded PNG data
- Images scaled to 720p before storage for efficiency
- Full screenshots captured every 10 seconds during active monitoring

## Security Considerations

### Credential Management
- MongoDB credentials never logged in plain text
- Connection strings masked in debug output
- Config.swift is gitignored to prevent credential exposure

### Network Security
- Atlas provides SSL/TLS encryption by default
- Local MongoDB should be firewalled for production use
- Consider VPN access for remote teacher monitoring

### Data Privacy
- Screenshots contain sensitive student screen data
- Consider data retention policies for student privacy
- Implement proper access controls for teacher accounts

## Troubleshooting

### Common Issues

1. **Connection Failed**: 
   - Verify connection string format
   - Check network access and firewall settings
   - Ensure MongoDB service is running

2. **Permission Denied**:
   - Verify database user has read/write permissions
   - Check IP whitelist settings in Atlas

3. **No Assignments Retrieved**:
   - Verify assignment document exists with correct classroom field
   - Check app logs for assignment fetch errors

4. **Data Not Updating**:
   - Ensure app has screen recording permissions
   - Check that AI analysis is completing successfully
   - Verify MongoDB write operations in logs

### Performance Optimization

- **Indexes**: Create index on `classroom` field for assignments collection
- **Connection Pooling**: MongoDB driver handles connection pooling automatically
- **Image Size**: Screenshots scaled to 720p for optimal storage/performance balance

```javascript
// Create index for faster assignment queries
db.assignments.createIndex({ classroom: 1 })

// Create index for faster student queries  
db.students.createIndex({ id: 1 })
db.students.createIndex({ classroom: 1 })
``` 