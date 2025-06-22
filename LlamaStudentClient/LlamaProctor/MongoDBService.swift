//
//  MongoDBService.swift
//  LlamaProctor
//
//  Created by Kevin Xiao on 6/21/25.
//

import Foundation
import MongoSwiftSync
import AppKit

class MongoDBService: ObservableObject {
    private let mongoURI: String
    private let databaseName = "LlamaProctorDB"
    private let collectionName = "students"
    private var client: MongoClient?
    private var database: MongoDatabase?
    private var collection: MongoCollection<BSONDocument>?
    
    init() {
        // Use the MongoDB Atlas connection string from Config
        self.mongoURI = Config.mongoDBURI
        
        // Debug: Print the URI with credentials masked for security
        let maskedURI = maskCredentials(in: mongoURI)
        print("MongoDB Service initialized with URI: \(maskedURI)")
        
        // Initialize MongoDB connection
        setupMongoDBConnection()
    }
    
    deinit {
        // Clean up MongoDB driver resources
        cleanupMongoSwift()
    }
    
    // MARK: - Helper Methods
    
    private func maskCredentials(in uri: String) -> String {
        // Mask username and password in the URI for security
        let pattern = "mongodb\\+srv://([^:]+):([^@]+)@"
        let maskedURI = uri.replacingOccurrences(of: pattern, with: "mongodb+srv://***:***@", options: .regularExpression)
        return maskedURI
    }
    
    // MARK: - MongoDB Connection Setup
    
    private func setupMongoDBConnection() {
        do {
            // Create MongoDB client
            client = try MongoClient(mongoURI)
            
            // Get database and collection
            database = client?.db(databaseName)
            collection = database?.collection(collectionName, withType: BSONDocument.self)
            
            print("✅ MongoDB connection established successfully")
            print("Database: \(databaseName)")
            print("Collection: \(collectionName)")
            
        } catch {
            print("❌ Failed to connect to MongoDB: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Student Document Management
    
    private func convertImageToBase64(_ image: NSImage) -> String? {
        guard let imageData = image.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: imageData),
              let pngData = bitmap.representation(using: .png, properties: [:]) else {
            print("Failed to convert image to PNG")
            return nil
        }
        return pngData.base64EncodedString()
    }
    
    func upsertStudentDocument(
        id: String = "1",
        focusScore: Int,
        description: String,
        shortDescription: String,
        history: [String],
        suggestion: String,
        screenshot: NSImage? = nil,
        classroom: String = "1",
        active: Bool = true,
        completion: @escaping (Bool, Error?) -> Void
    ) {
        guard let collection = collection else {
            let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB collection not available"])
            completion(false, error)
            return
        }
        
        // Create base document
        var document: BSONDocument = [
            "id": BSON(stringLiteral: id),
            "name": BSON(stringLiteral: "Kevin"),
            "focusScore": BSON(integerLiteral: focusScore),
            "description": BSON(stringLiteral: description),
            "shortDescription": BSON(stringLiteral: shortDescription),
            "history": .array(history.map { BSON.string($0) }),
            "classroom": BSON(stringLiteral: classroom),
            "active": BSON(booleanLiteral: active),
            "lastUpdated": BSON.datetime(Date())
        ]
        
        // Add screenshot if provided
        if let screenshot = screenshot,
           let base64Screenshot = convertImageToBase64(screenshot) {
            document["screenshot"] = BSON(stringLiteral: base64Screenshot)
            print("✅ Screenshot converted to base64 and added to document")
        } else {
            print("⚠️ No screenshot provided or failed to convert")
        }
        
        print("=== MONGODB OPERATION ===")
        print("Database: \(databaseName)")
        print("Collection: \(collectionName)")
        print("Document fields: \(document.keys)")
        //print("Screenshot included: \(screenshot != nil)")
        print("=========================")
        
        // Perform upsert operation on background queue
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // Create filter for upsert
                let filter: BSONDocument = ["id": BSON(stringLiteral: id)]
                
                // Perform upsert operation
                let options = ReplaceOptions(upsert: true)
                let result = try collection.replaceOne(filter: filter, replacement: document, options: options)
                
                DispatchQueue.main.async {
                    print("✅ Document upserted successfully")
                    print("Matched count: \(result?.matchedCount)")
                    print("Modified count: \(result?.modifiedCount)")
                    // Print upserted ID correctly
                    let upsertedIDString: String
                    if let upsertedID = result?.upsertedID, case let .objectID(objectId) = upsertedID {
                        upsertedIDString = objectId.hex
                    } else {
                        upsertedIDString = String(describing: result?.upsertedID ?? "N/A")
                    }
                    print("Upserted ID: \(upsertedIDString)")
                    
                    // Verify the document exists in the database
                    self.verifyDocumentExists(id: id) { exists, error in
                        if let error = error {
                            print("❌ Verification failed: \(error.localizedDescription)")
                            completion(false, error)
                            return
                        }
                        
                        if exists {
                            print("✅ Document successfully upserted and verified in database")
                            completion(true, nil)
                        } else {
                            print("❌ Document was not found in database after upsert")
                            let verificationError = NSError(domain: "MongoDBService", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Document verification failed after upsert"])
                            completion(false, verificationError)
                        }
                    }
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ MongoDB upsert failed: \(error.localizedDescription)")
                    completion(false, error)
                }
            }
        }
    }
    
    // MARK: - Document Verification
    
    private func verifyDocumentExists(id: String, completion: @escaping (Bool, Error?) -> Void) {
        guard let collection = collection else {
            let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB collection not available"])
            completion(false, error)
            return
        }
        
        print("=== VERIFYING DOCUMENT ===")
        print("Checking if document with id '\(id)' exists in database")
        
        // Perform database query on background queue
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // Create filter to find document by id
                let filter: BSONDocument = ["id": BSON(stringLiteral: id)]
                
                // Query the database
                let document = try collection.findOne(filter)
                
                DispatchQueue.main.async {
                    if let document = document {
                        print("✅ Document with id '\(id)' found in database")
                        //print("Document content: \(document)")
                        completion(true, nil)
                    } else {
                        print("❌ Document with id '\(id)' not found in database")
                        completion(false, nil)
                    }
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ Verification query failed: \(error.localizedDescription)")
                    completion(false, error)
                }
            }
        }
    }
    
    private func calculateNewFocusScore(currentScore: Int, llamaScore: Int) -> Int {
        var newScore = currentScore
        
        if llamaScore <= 2 {
            newScore = max(0, currentScore - 1)
        } else if llamaScore >= 4 {
            newScore = min(5, currentScore + 1)
        }
        // If llamaScore is 3, keep the same score
        
        return newScore
    }
    
    private func determineSuggestionFromFocusScore(_ focusScore: Int) -> String {
        if focusScore >= 4 {
            return "on-task"
        } else if focusScore <= 2 {
            return "needs reminder"
        } else {
            return "sussi"
        }
    }
    
    private func updateHistory(currentHistory: [String]?, newDescription: String) -> [String] {
        var history = currentHistory ?? []
        
        //print("=== HISTORY UPDATE ===")
        //print("Current history count: \(history.count)")
        //print("Current history: \(history)")
        //print("Adding new description: \(newDescription)")
        
        // Add the new description to the beginning of the list
        history.insert(newDescription, at: 0)
        
        // Keep only the 60 most recent entries
        if history.count > 60 {
            history = Array(history.prefix(60))
        }
        
        //print("New history count: \(history.count)")
        //print("New history: \(history)")
        //print("=====================")
        
        return history
    }
    
    func updateFocusScore(
        id: String = "1",
        llamaScore: Int,
        description: String,
        shortDescription: String,
        suggestion: String,
        screenshot: NSImage? = nil,
        completion: @escaping (Bool, Error?) -> Void
    ) {
        // First, get the current document to calculate the new focus score
        getStudentDocument(id: id) { [weak self] currentDocument, error in
            guard let self = self else { return }
            
            if error != nil {
                // If document doesn't exist, create it with initial values
                let newFocusScore = self.calculateNewFocusScore(currentScore: 5, llamaScore: llamaScore)
                let newHistory = self.updateHistory(currentHistory: nil, newDescription: description)
                self.upsertStudentDocument(
                    id: id,
                    focusScore: newFocusScore,
                    description: description,
                    shortDescription: shortDescription,
                    history: newHistory,
                    suggestion: suggestion,
                    screenshot: screenshot,
                    classroom: "1",
                    active: true,
                    completion: completion
                )
                return
            }
            
            // Calculate new focus score based on current score and Llama score
            let currentFocusScore = currentDocument?["focusScore"] as? Int ?? 5
            let newFocusScore = self.calculateNewFocusScore(currentScore: currentFocusScore, llamaScore: llamaScore)
            
            // Update history with new description (use the longer description, not shortDescription)
            let currentHistory = currentDocument?["history"] as? [String]
            let newHistory = self.updateHistory(currentHistory: currentHistory, newDescription: description)
            
            // Update the document
            self.upsertStudentDocument(
                id: id,
                focusScore: newFocusScore,
                description: description,
                shortDescription: shortDescription,
                history: newHistory,
                suggestion: suggestion,
                screenshot: screenshot,
                classroom: "1",
                active: true,
                completion: completion
            )
        }
    }
    
    func getStudentDocument(id: String = "1", completion: @escaping ([String: Any]?, Error?) -> Void) {
        guard let collection = collection else {
            let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB collection not available"])
            completion(nil, error)
            return
        }
        
        print("=== MONGODB QUERY ===")
        print("Querying document with id: \(id)")
        print("=====================")
        
        // Perform database query on background queue
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // Create filter to find document by id
                let filter: BSONDocument = ["id": BSON(stringLiteral: id)]
                
                // Query the database
                let document = try collection.findOne(filter)
                
                DispatchQueue.main.async {
                    if let document = document {
                        // Convert BSONDocument to [String: Any] for compatibility
                        let documentDict = self.convertBSONDocumentToDictionary(document)
                        print("✅ Document found")
                        completion(documentDict, nil)
                    } else {
                        print("❌ Document not found")
                        completion(nil, nil)
                    }
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ MongoDB query failed: \(error.localizedDescription)")
                    completion(nil, error)
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func convertBSONDocumentToDictionary(_ document: BSONDocument) -> [String: Any] {
        var result: [String: Any] = [:]
        
        for (key, value) in document {
            switch value {
            case .string(let string):
                result[key] = string
            case .int32(let int32):
                result[key] = Int(int32)
            case .int64(let int64):
                result[key] = Int(int64)
            case .double(let double):
                result[key] = double
            case .bool(let bool):
                result[key] = bool
            case .datetime(let date):
                result[key] = date.timeIntervalSince1970
            case .objectID(let objectId):
                result[key] = objectId.hex
            case .array(let array):
                // Convert BSON array to Swift array
                var swiftArray: [Any] = []
                for element in array {
                    switch element {
                    case .string(let string):
                        swiftArray.append(string)
                    case .int32(let int32):
                        swiftArray.append(Int(int32))
                    case .int64(let int64):
                        swiftArray.append(Int(int64))
                    case .double(let double):
                        swiftArray.append(double)
                    case .bool(let bool):
                        swiftArray.append(bool)
                    default:
                        swiftArray.append(String(describing: element))
                    }
                }
                result[key] = swiftArray
            default:
                result[key] = String(describing: value)
            }
        }
        
        return result
    }
    
    func setAppActiveStatus(active: Bool, id: String = "1", completion: @escaping (Bool, Error?) -> Void) {
        guard let collection = collection else {
            let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB collection not available"])
            completion(false, error)
            return
        }
        
        print("=== MONGODB UPDATE ===")
        print("Setting active status to: \(active) for id: \(id)")
        print("======================")
        
        // Perform update operation on background queue
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // Create filter to find document by id
                let filter: BSONDocument = ["id": BSON(stringLiteral: id)]
                
                // Create update document
                let update: BSONDocument = [
                    "$set": .document([
                        "active": .bool(active),
                        "lastUpdated": .datetime(Date())
                    ])
                ]
                
                // Perform update operation
                let result = try collection.updateOne(filter: filter, update: update)
                
                DispatchQueue.main.async {
                    print("✅ Active status updated successfully")
                    print("Matched count: \(result?.matchedCount ?? -1)")
                    print("Modified count: \(result?.modifiedCount ?? -1)")
                    // Print upserted ID correctly
                    let upsertedIDString: String
                    if let upsertedID = result?.upsertedID, case let .objectID(objectId) = upsertedID {
                        upsertedIDString = objectId.hex
                    } else {
                        upsertedIDString = String(describing: result?.upsertedID ?? "N/A")
                    }
                    print("Upserted ID: \(upsertedIDString)")
                    completion(true, nil)
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ MongoDB update failed: \(error.localizedDescription)")
                    completion(false, error)
                }
            }
        }
    }
    
    // MARK: - Assignment Management
    
    func getAssignment(classroom: String, completion: @escaping (String?, Error?) -> Void) {
        // Use background queue for MongoDB operations
        DispatchQueue.global(qos: .background).async { [weak self] in
            guard let client = self?.client else {
                let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB client not available"])
                DispatchQueue.main.async {
                    completion(nil, error)
                }
                return
            }
            
            do {
                // Get the assignments collection
                let database = client.db(self?.databaseName ?? "LlamaProctorDB")
                let assignmentsCollection = database.collection("assignments", withType: BSONDocument.self)
                
                // Query for assignment by classroom
                let query: BSONDocument = ["classroom": BSON(stringLiteral: classroom)]
                
                if let assignmentDoc = try assignmentsCollection.findOne(query) {
                    // Extract the description field
                    if let description = assignmentDoc["description"]?.stringValue {
                        DispatchQueue.main.async {
                            completion(description, nil)
                        }
                    } else {
                        DispatchQueue.main.async {
                            completion(nil, NSError(domain: "MongoDBService", code: 1001, userInfo: [NSLocalizedDescriptionKey: "No description field found in assignment document"]))
                        }
                    }
                } else {
                    // No assignment found for this classroom
                    DispatchQueue.main.async {
                        completion(nil, nil)
                    }
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ Failed to fetch assignment from MongoDB: \(error.localizedDescription)")
                    completion(nil, error)
                }
            }
        }
    }
    
    func getMessage(classroom: String, id: String, completion: @escaping (String?, Error?) -> Void) {
        // Use background queue for MongoDB operations
        DispatchQueue.global(qos: .background).async { [weak self] in
            guard let client = self?.client else {
                let error = NSError(domain: "MongoDBService", code: 1000, userInfo: [NSLocalizedDescriptionKey: "MongoDB client not available"])
                DispatchQueue.main.async {
                    completion(nil, error)
                }
                return
            }
            
            do {
                // Get the assignments collection
                let database = client.db(self?.databaseName ?? "LlamaProctorDB")
                let messageCollection = database.collection("messages", withType: BSONDocument.self)
                
                // Query for assignment by classroom
                let query: BSONDocument = ["classroom": BSON(stringLiteral: classroom), "id": BSON(stringLiteral: id)]
                
                if let messageDoc = try messageCollection.findOne(query) {
                    // Extract the description field
                    if let text = messageDoc["text"]?.stringValue {
                        
                        if let sender = messageDoc["sender"]?.stringValue {
                            let fullMessage = "\(text) - sent by \(sender)"
                            DispatchQueue.main.async {
                                completion(fullMessage, nil)
                            }
                        } else {
                            DispatchQueue.main.async {
                                completion(text, nil)
                            }
                        }
                    } else {
                        DispatchQueue.main.async {
                            completion(nil, NSError(domain: "MongoDBService", code: 1001, userInfo: [NSLocalizedDescriptionKey: "No text field found in assignment document"]))
                        }
                    }
                } else {
                    // No assignment found for this classroom
                    DispatchQueue.main.async {
                        completion(nil, nil)
                    }
                }
                
            } catch {
                DispatchQueue.main.async {
                    print("❌ Failed to fetch assignment from MongoDB: \(error.localizedDescription)")
                    completion(nil, error)
                }
            }
        }
    }
}
