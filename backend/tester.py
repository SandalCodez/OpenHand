
from FireStoreDB import FireStoreDB

if __name__ == "__main__":
    print("Test connection...")
    
    # Create instance and connect
    db = FireStoreDB()  
    firestore_client = db.connect()
    
    if firestore_client:
        print("     Successfully connected to Firestore!     ")
        
        # Test basic read/write operations
        try:
            # Try to write a test document
            test_ref = firestore_client.collection('test').document('connection_test')
            test_ref.set({
                'message': 'Hello from Python!',
                'timestamp': firestore.SERVER_TIMESTAMP,
                'test': True
            })
            print("✅ Write operation successful!")
            
            # Try to read the test document
            doc = test_ref.get()
            if doc.exists:
                print("✅ Read operation successful!")
                print(f"📄 Document data: {doc.to_dict()}")
                
                # Clean up - delete the test document
                test_ref.delete()
                print("✅ Test document cleaned up!")
            else:
                print("Document doesn't exist")
                
        except Exception as e:
            print(f"Database operation failed: {e}")
    else:
        print("Failed to connect to Firestore")
