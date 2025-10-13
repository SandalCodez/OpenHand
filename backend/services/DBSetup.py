from FireStoreDB import FireStoreDB
from firebase_admin import firestore
import sys
import os
from FireStoreDB import FireStoreDB

def setup():
    db = FireStoreDB()
    client = db.connect()
    if not client:
        print("no connection")
        return
    print("good connection\n makeing lessons")

    lessons = [
        {

            # Basic info per lesson
            "lesson_id": "alpha_A",
            "Title": "Letter A",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 1,

            # Addtional data for lesson
            "imageURL": "imageURL",
            "instructions": "Make a fist with thumb resting against the side of your index finger",

            # lesson metrics
            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True
            
        },{
            "lesson_id": "alpha_B",
            "Title": "Letter B",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 2,

            "imageURL": "imageURL",
            "instructions": "Hold fingers straight up together, thumb folded across palm",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_C",
            "Title": "Letter C",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 3,

            "imageURL": "imageURL",
            "instructions": "Curve hand to form a C shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_D",
            "Title": "Letter D",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 4,

            "imageURL": "imageURL",
            "instructions": "Touch thumb to middle and ring fingers, index finger points up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_E",
            "Title": "Letter E",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 5,

            "imageURL": "imageURL",
            "instructions": "Curl all fingers down to touch thumb",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_F",
            "Title": "Letter F",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 6,

            "imageURL": "imageURL",
            "instructions": "Touch thumb and index finger together, other three fingers up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_G",
            "Title": "Letter G",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 7,

            "imageURL": "imageURL",
            "instructions": "Point index finger and thumb horizontally, like a gun shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_H",
            "Title": "Letter H",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 8,

            "imageURL": "imageURL",
            "instructions": "Extend index and middle fingers horizontally, thumb holds other fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_I",
            "Title": "Letter I",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 9,

            "imageURL": "imageURL",
            "instructions": "Make a fist with pinky finger extended up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_J",
            "Title": "Letter J",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 10,

            "imageURL": "imageURL",
            "instructions": "Make letter I, then draw a J shape in the air",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_K",
            "Title": "Letter K",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 11,

            "imageURL": "imageURL",
            "instructions": "Index finger up, middle finger angled out, thumb between them",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_L",
            "Title": "Letter L",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 12,

            "imageURL": "imageURL",
            "instructions": "Extend index finger up and thumb out, forming an L",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_M",
            "Title": "Letter M",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 13,

            "imageURL": "imageURL",
            "instructions": "Make a fist with thumb under first three fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_N",
            "Title": "Letter N",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 14,

            "imageURL": "imageURL",
            "instructions": "Make a fist with thumb under first two fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_O",
            "Title": "Letter O",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 15,

            "imageURL": "imageURL",
            "instructions": "Curve all fingers to meet thumb, forming an O shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_P",
            "Title": "Letter P",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 16,

            "imageURL": "imageURL",
            "instructions": "Like K, but angled downward",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Q",
            "Title": "Letter Q",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 17,

            "imageURL": "imageURL",
            "instructions": "Like G, but angled downward",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_R",
            "Title": "Letter R",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 18,

            "imageURL": "imageURL",
            "instructions": "Cross index finger over middle finger, other fingers down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_S",
            "Title": "Letter S",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 19,

            "imageURL": "imageURL",
            "instructions": "Make a fist with thumb across the front of fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_T",
            "Title": "Letter T",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 20,

            "imageURL": "imageURL",
            "instructions": "Make a fist with thumb between index and middle fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_U",
            "Title": "Letter U",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 21,

            "imageURL": "imageURL",
            "instructions": "Extend index and middle fingers up together, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_V",
            "Title": "Letter V",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 22,

            "imageURL": "imageURL",
            "instructions": "Extend index and middle fingers up in a V, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_W",
            "Title": "Letter W",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 23,

            "imageURL": "imageURL",
            "instructions": "Extend index, middle, and ring fingers up, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_X",
            "Title": "Letter X",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 24,

            "imageURL": "imageURL",
            "instructions": "Make a fist with index finger bent in a hook shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Y",
            "Title": "Letter Y",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 25,

            "imageURL": "imageURL",
            "instructions": "Extend thumb and pinky out, other fingers down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Z",
            "Title": "Letter Z",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 26,

            "imageURL": "imageURL",
            "instructions": "Point index finger and draw a Z shape in the air",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
        ,{
            "lesson_id": "num_1",
            "Title": "Number 1",
            "category": "Number",
            "difficulty": "beginner",
            "order": 1,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 1",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
         ,{
            "lesson_id": "num_2",
            "Title": "Number 2",
            "category": "Number",
            "difficulty": "beginner",
            "order": 2,

            "imageURL": "imageURL",
            "instructions": "instructions for the number",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_3",
            "Title": "Number 3",
            "category": "Number",
            "difficulty": "beginner",
            "order": 3,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 3",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_4",
            "Title": "Number 4",
            "category": "Number",
            "difficulty": "beginner",
            "order": 4,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 4",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_5",
            "Title": "Number 5",
            "category": "Number",
            "difficulty": "beginner",
            "order": 5,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 5",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_6",
            "Title": "Number 6",
            "category": "Number",
            "difficulty": "beginner",
            "order": 6,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 6",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_7",
            "Title": "Number 7",
            "category": "Number",
            "difficulty": "beginner",
            "order": 7,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 7",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_8",
            "Title": "Number 8",
            "category": "Number",
            "difficulty": "beginner",
            "order": 8,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 8",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_9",
            "Title": "Number 9",
            "category": "Number",
            "difficulty": "beginner",
            "order": 9,

            "imageURL": "imageURL",
            "instructions": "instructions for the number 9",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } 
    ]
    for lesson in lessons:
        try: 
            client.collection('lessons').document(lesson['lesson_id']).set(lesson)
            print(f"lesson created: {lesson['Title']}")
        except Exception as e:
            print(f"failed to created lesson {lesson['Title']}")
if __name__ == "__main__":
    setup()
    
