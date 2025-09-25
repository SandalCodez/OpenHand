
from services.FireStoreDB import FireStoreDB
from services.UserAuth import UserAuth


if __name__ == "__main__":
    print("Test connection...")
    
    # Create instance and connect
    db = FireStoreDB()  
    firestore_client = db.connect()
    
    if firestore_client:
        print("     Successfully connected to Firestore!     ")
    print("registered user test:")
    userAuth = UserAuth(firestore_client)

    testEmail = "esteban@gmail.com"
    testPass = "helloo122000"
    testUserName = "testUserName"
# hey nadir
    uid  = userAuth.register_user(testEmail,testPass, testUserName)
    print("test passed\n User " + uid + " created")

    # print("login check:")
    # check = userAuth.login_user(testEmail, testPass)
    # if(check):
    #     print(check.first_name)
    #     print(check.last_name)


        
    #     # Test basic read/write operations
    #     try:
    #         # Try to write a test document
    #         test_ref = firestore_client.collection('test').document('connection_test')
    #         test_ref.set({
    #             'message': 'Hello from Python!',
               
    #             'test': True
    #         })
    #         print("✅ Write operation successful!")
            
    #         # Try to read the test document
    #         doc = test_ref.get()
    #         if doc.exists:
    #             print("✅ Read operation successful!")
    #             print(f"📄 Document data: {doc.to_dict()}")
                
    #             # Clean up - delete the test document
    #             test_ref.delete()
    #             print("✅ Test document cleaned up!")
    #         else:
    #             print("Document doesn't exist")
                
    #     except Exception as e:
    #         print(f"Database operation failed: {e}")
    # else:
    #     print("Failed to connect to Firestore")
