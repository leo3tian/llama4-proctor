//
//  ContentView.swift
//  LlamaProctor
//
//  Created by Kevin Xiao on 6/21/25.
//

import SwiftUI
import Combine
import Cocoa
@preconcurrency import ScreenCaptureKit

class StreamManager: NSObject, ObservableObject {
    private var stream: SCStream?
    private var output: ContentView.ScreenshotStreamOutput?
    private var isCapturing = false
    
    override init() {
        super.init()
        setupStream()
    }
    
    private func setupStream() {
        Task { @MainActor in
            do {
                let displays = try await SCShareableContent.current.displays
                guard let mainDisplay = displays.first(where: { $0.displayID == CGMainDisplayID() }) else {
                    print("Main display not found")
                    return
                }

                let config = SCStreamConfiguration()
                config.width = mainDisplay.width
                config.height = mainDisplay.height
                config.pixelFormat = kCVPixelFormatType_32BGRA
                config.capturesAudio = false
                config.sampleRate = 0
                config.channelCount = 0

                let stream = SCStream(filter: SCContentFilter(display: mainDisplay, excludingWindows: []), configuration: config, delegate: nil)
                
                let output = ContentView.ScreenshotStreamOutput()
                try stream.addStreamOutput(output, type: .screen, sampleHandlerQueue: DispatchQueue.main)
                
                self.stream = stream
                self.output = output
                
                print("Stream setup completed")
            } catch {
                print("Stream setup failed: \(error)")
            }
        }
    }

    func captureScreenshot(completion: @escaping (NSImage?) -> Void) {
        guard let stream = stream, let output = output else {
            print("Stream not ready")
            completion(nil)
            return
        }
        
        guard !isCapturing else {
            print("Already capturing, skipping")
            return
        }
        
        isCapturing = true
        output.onCapture = { [weak self] (image: NSImage?) in
            // Only call completion if we actually got an image
            if let image = image {
                completion(image)
            }
            self?.isCapturing = false
        }
        
        Task { [weak self] in
            do {
                try await stream.startCapture()
                
                // Stop after a short delay to capture one frame
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    Task {
                        do {
                            try await stream.stopCapture()
                        } catch {
                            print("Error stopping stream: \(error)")
                            self?.isCapturing = false
                        }
                    }
                }
            } catch {
                print("Error starting capture: \(error)")
                self?.isCapturing = false
                completion(nil)
            }
        }
    }
    
    deinit {
        // Don't use Task in deinit as it can cause issues
        // The stream will be cleaned up automatically
        print("StreamManager deinitialized")
    }
}

struct ContentView: View {
    @State private var screenshotTimerCancellable: AnyCancellable?
    @State private var windowTimerCancellable: AnyCancellable?
    @State private var assignmentTimerCancellable: AnyCancellable?
    @State private var windowsInfo: [String] = []
    @State private var latestScreenshot: NSImage? = nil
    @State private var teacherTaskDescription: String = ""
    @State private var teacherMessage: String = ""
    @State private var latestAnalysis: [String: Any]? = nil
    @State private var isAnalyzing: Bool = false
    @StateObject private var streamManager = StreamManager()
    @StateObject private var mongoDBService = MongoDBService()
    
    // Request tracking to prevent race conditions
    @State private var currentRequestTimestamp: Date = Date()
    @State private var pendingRequests: Set<Date> = []
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("LlamaProctor Running")
                .font(.headline)
            
            Divider()
            
            VStack(alignment: .leading) {
                Text("Current Assignment from Teacher:")
                    .font(.subheadline)
                Text(teacherTaskDescription.isEmpty ? "No assignment retrieved yet..." : teacherTaskDescription)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                    .foregroundColor(teacherTaskDescription.isEmpty ? .secondary : .primary)
            }
            
            Divider()
            
            VStack(alignment: .leading) {
                Text("Recent Message from Teacher:")
                    .font(.subheadline)
                Text(teacherMessage.isEmpty ? "No message yet..." : teacherMessage)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                    .foregroundColor(teacherMessage.isEmpty ? .secondary : .primary)
            }
            
            Divider()
            
            Text("Active Window:")
                .font(.subheadline)
            List(windowsInfo, id: \.self) { window in
                Text(window)
            }
            
            Divider()
            
            if let analysis = latestAnalysis {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Student Activity Analysis:")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        Text("Score:")
                            .fontWeight(.medium)
                        Text("\(analysis["score"] as? Int ?? 0)/5")
                            .foregroundColor(.blue)
                        
                        Spacer()
                        
                        Text("Summary:")
                            .fontWeight(.medium)
                        Text(analysis["threeWordDescription"] as? String ?? "Unknown")
                            .foregroundColor(.orange)
                            .fontWeight(.medium)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Description:")
                            .fontWeight(.medium)
                        Text(analysis["briefDescription"] as? String ?? "No description available")
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    
                    HStack {
                        Text("Teacher Action:")
                            .fontWeight(.medium)
                        Text(analysis["suggestion"] as? String ?? "No suggestion available")
                            .foregroundColor(getColorForSuggestion(analysis["suggestion"] as? String ?? ""))
                            .fontWeight(.medium)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
            }
            
            Divider()
            
            if let image = latestScreenshot {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 500)
            } else {
                Text("No screenshot available")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .onAppear {
            startBackgroundTasks()
            // Set app as active when it appears
            mongoDBService.setAppActiveStatus(active: true) { success, error in
                if let error = error {
                    print("❌ Failed to set app as active: \(error.localizedDescription)")
                } else {
                    print("🟢 App status: Active")
                }
            }
        }
        .onDisappear {
            screenshotTimerCancellable?.cancel()
            windowTimerCancellable?.cancel()
            assignmentTimerCancellable?.cancel()
            
            // Clear all pending requests
            pendingRequests.removeAll()
            isAnalyzing = false
            
            // Set app as inactive when it disappears
            mongoDBService.setAppActiveStatus(active: false) { success, error in
                if let error = error {
                    print("❌ Failed to set app as inactive: \(error.localizedDescription)")
                } else {
                    print("🔴 App status: Inactive")
                }
            }
        }
    }

    func startBackgroundTasks() {
        // Give the stream manager a moment to set up
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            // Screenshot timer - every 10 seconds
            screenshotTimerCancellable = Timer.publish(every: 10, on: .main, in: .common)
                .autoconnect()
                .sink { _ in
                    streamManager.captureScreenshot { image in
                        DispatchQueue.main.async {
                            // Only update if we got a new image
                            if let image = image {
                                latestScreenshot = image
                                // Analyze with Llama API if we have a task description and not already analyzing
                                if !teacherTaskDescription.isEmpty && !isAnalyzing {
                                    // Create a new request timestamp
                                    let requestTimestamp = Date()
                                    currentRequestTimestamp = requestTimestamp
                                    pendingRequests.insert(requestTimestamp)
                                    
                                    analyzeStudentActivity(
                                        image: image, 
                                        windows: windowsInfo, 
                                        taskDescription: teacherTaskDescription,
                                        requestTimestamp: requestTimestamp
                                    )
                                }
                            }
                        }
                    }
                }
            
            // Window info timer - every 1 second
            windowTimerCancellable = Timer.publish(every: 1, on: .main, in: .common)
                .autoconnect()
                .sink { _ in
                    let windowTitles = getOpenWindowTitles()
                    windowsInfo = windowTitles
                }
            
            // Assignment retrieval timer - every 5 seconds
            assignmentTimerCancellable = Timer.publish(every: 5, on: .main, in: .common)
                .autoconnect()
                .sink { _ in
                    fetchAssignmentFromMongoDB()
                    fetchMessageFromMongoDB()
                }
            
            // Fetch assignment immediately on startup
            fetchAssignmentFromMongoDB()
            fetchMessageFromMongoDB()
        }
    }
    
    func analyzeStudentActivity(image: NSImage, windows: [String], taskDescription: String, requestTimestamp: Date) {
        // Set analyzing state for UI feedback
        DispatchQueue.main.async {
            self.isAnalyzing = true
        }
        
        // Record start time for performance tracking
        let startTime = Date()
        print("🚀 Starting Llama analysis at \(startTime)")
        
        // Scale down image to 720p to reduce inference time
        let scaledImage = scaleImageTo720p(image)
        
        guard let imageData = scaledImage.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: imageData),
              let pngData = bitmap.representation(using: .png, properties: [:]) else {
            print("❌ Image conversion failed")
            DispatchQueue.main.async {
                self.isAnalyzing = false
            }
            return
        }
        
        // Convert image to base64
        let base64Image = pngData.base64EncodedString()
        
        // Prepare the request
        let requestBody: [String: Any] = [
            "model": "Llama-4-Scout-17B-16E-Instruct-FP8",
            "messages": [
                [
                    "role": "system",
                    "content": "You are an AI assistant helping teachers monitor student activity during class. Analyze the student's screen activity and compare it to the teacher's intended task. Consider all on-screen elements while putting the most weight on the active window. Only consider the most recent screenshot. \n\n For every query, provide the following items: \n - A score from 0 to 5 (inclusive) for how on-task the student is \n - A ONE-SENTENCE, BRIEF description of what the student appears to be doing \n - A VERY SHORT 3-WORD MAXIMUM summary \n - A short suggestion for the teacher. For the suggestion: if student is on-task, indicate 'on-task'. If not obviously on-task, indicate 'Sussi'. If truly off-task, indicate 'Needs reminder'."
                ],
                [
                    "role": "user",
                    "content": [
                        [
                            "type": "text",
                            "text": "Teacher's Task: \(taskDescription)\n\nActive Windows: \(windows.joined(separator: ", "))\n\nPlease analyze this student's activity and provide insights."
                        ],
                        [
                            "type": "image_url",
                            "image_url": [
                                "url": "data:image/png;base64,\(base64Image)"
                            ]
                        ]
                    ]
                ]
            ],
            "response_format": [
                "type": "json_schema",
                "json_schema": [
                    "name": "StudentActivityAnalysis",
                    "schema": [
                        "properties": [
                            "score": [
                                "type": "integer",
                                "description": "Score from 0 to 5 for how on-task the student's activity is to the teacher's task"
                            ],
                            "briefDescription": [
                                "type": "string",
                                "description": "A SHORT 1 SENTENCE summary of what the student seems to be doing. Mention all important on-screen elements."
                            ],
                            "threeWordDescription": [
                                "type": "string",
                                "description": "A VERY SHORT 3-WORD MAXIMUM summary of the student's activity"
                            ],
                            "suggestion": [
                                "type": "string",
                                "description": "A very short suggestion for the teacher. If student is on-task, indicate 'on-task'. If not obviously on-task, indicate 'Sussi'. If truly off-task, indicate 'Needs reminder'."
                            ]
                        ],
                        "required": ["score", "briefDescription", "threeWordDescription", "suggestion"],
                        "type": "object"
                    ]
                ]
            ]
        ]
        
        // Make the API call
        var request = URLRequest(url: URL(string: "https://api.llama.com/v1/chat/completions")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(Config.llamaAPIKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type");
            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
                print("📸 Analyzing screenshot for task: \(taskDescription.prefix(30))...")
            } catch {
            print("❌ Request serialization failed")
            DispatchQueue.main.async {
                self.isAnalyzing = false
            }
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            // Check if this request is still the most recent one
            if requestTimestamp != self.currentRequestTimestamp {
                let endTime = Date()
                let duration = endTime.timeIntervalSince(startTime)
                print("🔄 Ignoring outdated request from \(requestTimestamp) after \(String(format: "%.2f", duration)) seconds")
                DispatchQueue.main.async {
                    self.pendingRequests.remove(requestTimestamp)
                    // Only set analyzing to false if no other requests are pending
                    if self.pendingRequests.isEmpty {
                        self.isAnalyzing = false
                    }
                }
                return
            }
            
            if let error = error {
                let endTime = Date()
                let duration = endTime.timeIntervalSince(startTime)
                print("❌ API call error after \(String(format: "%.2f", duration)) seconds: \(error)")
                DispatchQueue.main.async {
                    self.pendingRequests.remove(requestTimestamp)
                    if self.pendingRequests.isEmpty {
                        self.isAnalyzing = false
                    }
                }
                return
            }
            
            guard let data = data else {
                let endTime = Date()
                let duration = endTime.timeIntervalSince(startTime)
                print("❌ No data received after \(String(format: "%.2f", duration)) seconds")
                DispatchQueue.main.async {
                    self.pendingRequests.remove(requestTimestamp)
                    if self.pendingRequests.isEmpty {
                        self.isAnalyzing = false
                    }
                }
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    // Try the new completion_message format first
                    if let completionMessage = json["completion_message"] as? [String: Any],
                       let content = completionMessage["content"] as? [String: Any],
                       let text = content["text"] as? String {
                        
                        // Parse the structured JSON response from the text field
                        if let contentData = text.data(using: .utf8),
                           let analysisData = try JSONSerialization.jsonObject(with: contentData) as? [String: Any] {
                            
                            // Check if this request is still the most recent one
                            if requestTimestamp != self.currentRequestTimestamp {
                                let endTime = Date()
                                let duration = endTime.timeIntervalSince(startTime)
                                print("🔄 Ignoring outdated response from \(requestTimestamp) after \(String(format: "%.2f", duration)) seconds")
                                DispatchQueue.main.async {
                                    self.pendingRequests.remove(requestTimestamp)
                                    if self.pendingRequests.isEmpty {
                                        self.isAnalyzing = false
                                    }
                                }
                                return
                            }
                            
                            DispatchQueue.main.async {
                                self.latestAnalysis = analysisData
                                self.pendingRequests.remove(requestTimestamp)
                                if self.pendingRequests.isEmpty {
                                    self.isAnalyzing = false
                                }
                                
                                // Store in MongoDB
                                self.storeAnalysisInMongoDB(analysisData, image: image, windows: windows, taskDescription: taskDescription)
                            }
                            
                            // Enhanced logging with all analysis details
                            let score = analysisData["score"] as? Int ?? 0
                            let description = analysisData["briefDescription"] as? String ?? "No description"
                            let shortDescription = analysisData["threeWordDescription"] as? String ?? "No short description"
                            let suggestion = analysisData["suggestion"] as? String ?? "No suggestion"
                            
                            // Calculate and log timing
                            let endTime = Date()
                            let duration = endTime.timeIntervalSince(startTime)
                            
                            print("🤖 LLAMA ANALYSIS COMPLETE (Request: \(requestTimestamp))")
                            print("⏱️ Duration: \(String(format: "%.2f", duration)) seconds")
                            print("📊 Score: \(score)/5")
                            print("📝 Description: \(description)")
                            print("🏷️ Short Description: \(shortDescription)")
                            print("💡 Suggestion: \(suggestion)")
                            print("✅ Analysis: \(score)/5 - \(shortDescription)")
                            
                        } else {
                            let endTime = Date()
                            let duration = endTime.timeIntervalSince(startTime)
                            print("❌ Failed to parse JSON from completion_message text after \(String(format: "%.2f", duration)) seconds")
                            DispatchQueue.main.async {
                                self.pendingRequests.remove(requestTimestamp)
                                if self.pendingRequests.isEmpty {
                                    self.isAnalyzing = false
                                }
                            }
                        }
                    }
                    // Fallback to standard choices format
                    else if let choices = json["choices"] as? [[String: Any]],
                              let firstChoice = choices.first,
                              let message = firstChoice["message"] as? [String: Any],
                              let content = message["content"] as? String {
                        
                        // Parse the structured JSON response
                        if let contentData = content.data(using: .utf8),
                           let analysisData = try JSONSerialization.jsonObject(with: contentData) as? [String: Any] {
                            
                            // Check if this request is still the most recent one
                            if requestTimestamp != self.currentRequestTimestamp {
                                let endTime = Date()
                                let duration = endTime.timeIntervalSince(startTime)
                                print("🔄 Ignoring outdated response from \(requestTimestamp) after \(String(format: "%.2f", duration)) seconds")
                                DispatchQueue.main.async {
                                    self.pendingRequests.remove(requestTimestamp)
                                    if self.pendingRequests.isEmpty {
                                        self.isAnalyzing = false
                                    }
                                }
                                return
                            }
                            
                            DispatchQueue.main.async {
                                self.latestAnalysis = analysisData
                                self.pendingRequests.remove(requestTimestamp)
                                if self.pendingRequests.isEmpty {
                                    self.isAnalyzing = false
                                }
                                
                                // Store in MongoDB
                                self.storeAnalysisInMongoDB(analysisData, image: image, windows: windows, taskDescription: taskDescription)
                            }
                            
                            // Enhanced logging with all analysis details
                            let score = analysisData["score"] as? Int ?? 0
                            let description = analysisData["briefDescription"] as? String ?? "No description"
                            let shortDescription = analysisData["threeWordDescription"] as? String ?? "No short description"
                            let suggestion = analysisData["suggestion"] as? String ?? "No suggestion"
                            
                            // Calculate and log timing
                            let endTime = Date()
                            let duration = endTime.timeIntervalSince(startTime)
                            
                            print("🤖 LLAMA ANALYSIS COMPLETE (Request: \(requestTimestamp))")
                            print("⏱️ Duration: \(String(format: "%.2f", duration)) seconds")
                            print("📊 Score: \(score)/5")
                            print("📝 Description: \(description)")
                            print("🏷️ Short Description: \(shortDescription)")
                            print("💡 Suggestion: \(suggestion)")
                            print("✅ Analysis: \(score)/5 - \(shortDescription)")
                            
                        } else {
                            let endTime = Date()
                            let duration = endTime.timeIntervalSince(startTime)
                            print("❌ Failed to parse JSON from choices content after \(String(format: "%.2f", duration)) seconds")
                            DispatchQueue.main.async {
                                self.pendingRequests.remove(requestTimestamp)
                                if self.pendingRequests.isEmpty {
                                    self.isAnalyzing = false
                                }
                            }
                        }
                    } else {
                        let endTime = Date()
                        let duration = endTime.timeIntervalSince(startTime)
                        print("❌ Failed to parse expected response structure after \(String(format: "%.2f", duration)) seconds")
                        DispatchQueue.main.async {
                            self.pendingRequests.remove(requestTimestamp)
                            if self.pendingRequests.isEmpty {
                                self.isAnalyzing = false
                            }
                        }
                    }
                }
            } catch {
                let endTime = Date()
                let duration = endTime.timeIntervalSince(startTime)
                print("❌ Failed to parse response after \(String(format: "%.2f", duration)) seconds: \(error)")
                DispatchQueue.main.async {
                    self.pendingRequests.remove(requestTimestamp)
                    if self.pendingRequests.isEmpty {
                        self.isAnalyzing = false
                    }
                }
            }
        }.resume()
    }
    
    func storeAnalysisInMongoDB(_ analysis: [String: Any], image: NSImage, windows: [String], taskDescription: String) {
        guard let score = analysis["score"] as? Int,
              let description = analysis["briefDescription"] as? String,
              let shortDescription = analysis["threeWordDescription"] as? String,
              let suggestion = analysis["suggestion"] as? String else {
            print("Invalid analysis data for MongoDB storage")
            return
        }
        
        // Update the focus score in MongoDB based on Llama's score
        mongoDBService.updateFocusScore(
            id: "1",
            llamaScore: score,
            description: description,
            shortDescription: shortDescription,
            suggestion: suggestion,
            screenshot: image
        ) { success, error in
            if let error = error {
                print("❌ MongoDB update failed: \(error.localizedDescription)")
            } else {
                print("💾 MongoDB updated successfully")
            }
        }
    }

    class ScreenshotStreamOutput: NSObject, SCStreamOutput {
        var onCapture: ((NSImage?) -> Void)?

        func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of outputType: SCStreamOutputType) {
            guard let pixelBuffer = sampleBuffer.imageBuffer else {
                DispatchQueue.main.async { [weak self] in
                    self?.onCapture?(nil)
                }
                return
            }
            
            let width = CVPixelBufferGetWidth(pixelBuffer)
            let height = CVPixelBufferGetHeight(pixelBuffer)
            guard width > 0 && height > 0 else {
                DispatchQueue.main.async { [weak self] in
                    self?.onCapture?(nil)
                }
                return
            }
            
            let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
            let rep = NSCIImageRep(ciImage: ciImage)
            let nsImage = NSImage(size: rep.size)
            nsImage.addRepresentation(rep)
            
            DispatchQueue.main.async { [weak self] in
                self?.onCapture?(nsImage)
            }
        }
        
        func stream(_ stream: SCStream, didStopWithError error: Error) {
            print("Stream stopped with error: \(error)")
        }
    }

    func getOpenWindowTitles() -> [String] {
        guard let windowListInfo = CGWindowListCopyWindowInfo(
            [.optionOnScreenOnly, .excludeDesktopElements],
            kCGNullWindowID
        ) as? [[String: Any]] else {
            return []
        }

        guard let frontmostAppPID = NSWorkspace.shared.frontmostApplication?.processIdentifier else {
            return []
        }

        return windowListInfo.compactMap { dict in
            guard let pid = dict["kCGWindowOwnerPID"] as? pid_t,
                  pid == frontmostAppPID,
                  let ownerName = dict["kCGWindowOwnerName"] as? String,
                  let windowName = dict["kCGWindowName"] as? String else {
                return nil
            }
            return "\(ownerName): \(windowName)"
        }
    }
    
    func fetchAssignmentFromMongoDB() {
        mongoDBService.getAssignment(classroom: "1") { assignment, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("❌ Assignment fetch failed: \(error.localizedDescription)")
                    return
                }
                
                if let assignment = assignment {
                    self.teacherTaskDescription = assignment
                    print("📋 Assignment: \(assignment.prefix(50))...")
                } else {
                    print("📋 No assignment found")
                }
            }
        }
    }
    
    func fetchMessageFromMongoDB() {
        mongoDBService.getMessage(classroom: "1", id: "1") { message, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("❌ Message fetch failed: \(error.localizedDescription)")
                    return
                }
                
                if let message = message {
                    self.teacherMessage = message
                    print("📋 Message: \(message.prefix(50))...")
                } else {
                    print("📋 No message found")
                }
            }
        }
    }
    
    func getColorForSuggestion(_ suggestion: String) -> Color {
        let lowercased = suggestion.lowercased()
        if lowercased.contains("on-task") {
            return .green
        } else if lowercased.contains("sussy") || lowercased.contains("sussi") {
            return .orange
        } else if lowercased.contains("needs reminder") {
            return .red
        } else {
            return .secondary
        }
    }
}

// MARK: - Helper Functions

func scaleImageTo720p(_ image: NSImage) -> NSImage {
    let originalSize = image.size
    let targetHeight: CGFloat = 720.0
    
    // Calculate the aspect ratio
    let aspectRatio = originalSize.width / originalSize.height
    let targetWidth = targetHeight * aspectRatio
    let targetSize = NSSize(width: targetWidth, height: targetHeight)
    
    // If the image is already smaller or equal to 720p, return the original
    if originalSize.height <= targetHeight {
        return image
    }
    
    // Create a new image with the target size
    let resizedImage = NSImage(size: targetSize)
    resizedImage.lockFocus()
    
    // Draw the original image scaled to the new size
    image.draw(in: NSRect(origin: .zero, size: targetSize))
    
    resizedImage.unlockFocus()
    
    print("🔄 Scaled: \(Int(originalSize.width))x\(Int(originalSize.height)) → \(Int(targetSize.width))x\(Int(targetSize.height))")
    
    return resizedImage
}

#Preview {
    ContentView()
}
