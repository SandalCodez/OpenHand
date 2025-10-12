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
            "lesson_id": "alpa_A",
            "Title": "Letter A",
            "category": "alphabet",
            "order": 1,

            # Addtional data for lesson
            "imageURL": "imageURL",
            "instructions": "instructions for the letter A",

            # lesson metrics
            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True
            
        },{
            "lesson_id": "alpa_B",
            "Title": "Letter B",
            "category": "alphabet",
            "order": 2,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_C",
            "Title": "Letter C",
            "category": "alphabet",
            "order": 3,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_D",
            "Title": "Letter D",
            "category": "alphabet",
            "order": 4,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_E",
            "Title": "Letter E",
            "category": "alphabet",
            "order": 5,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_F",
            "Title": "Letter F",
            "category": "alphabet",
            "order": 6,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_G",
            "Title": "Letter G",
            "category": "alphabet",
            "order": 7,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_H",
            "Title": "Letter H",
            "category": "alphabet",
            "order": 8,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_I",
            "Title": "Letter I",
            "category": "alphabet",
            "order": 9,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_J",
            "Title": "Letter J",
            "category": "alphabet",
            "order": 10,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_K",
            "Title": "Letter K",
            "category": "alphabet",
            "order": 11,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_L",
            "Title": "Letter L",
            "category": "alphabet",
            "order": 12,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_M",
            "Title": "Letter M",
            "category": "alphabet",
            "order": 13,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_N",
            "Title": "Letter N",
            "category": "alphabet",
            "order": 14,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_O",
            "Title": "Letter O",
            "category": "alphabet",
            "order": 15,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_P",
            "Title": "Letter P",
            "category": "alphabet",
            "order": 16,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_Q",
            "Title": "Letter Q",
            "category": "alphabet",
            "order": 17,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_R",
            "Title": "Letter R",
            "category": "alphabet",
            "order": 18,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_S",
            "Title": "Letter S",
            "category": "alphabet",
            "order": 19,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_T",
            "Title": "Letter T",
            "category": "alphabet",
            "order": 20,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_U",
            "Title": "Letter U",
            "category": "alphabet",
            "order": 21,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_V",
            "Title": "Letter V",
            "category": "alphabet",
            "order": 22,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_W",
            "Title": "Letter W",
            "category": "alphabet",
            "order": 23,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_X",
            "Title": "Letter X",
            "category": "alphabet",
            "order": 24,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_Y",
            "Title": "Letter Y",
            "category": "alphabet",
            "order": 25,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpa_Z",
            "Title": "Letter Z",
            "category": "alphabet",
            "order": 26,

            "imageURL": "imageURL",
            "instructions": "instructions for the letter",

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
    
