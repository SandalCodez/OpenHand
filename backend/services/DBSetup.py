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
            "title": "Letter A",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 1,

            # Addtional data for lesson
            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500310/Doodle_Handz_Vector_A_yzdvxo.png",
            "instructions": "Make a fist with thumb resting against the side of your index finger",

            # lesson metrics
            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True
            
        },{
            "lesson_id": "alpha_B",
            "title": "Letter B",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 2,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500310/Doodle_Handz_Vector_B_pcrt6f.png",
            "instructions": "Hold fingers straight up together, thumb folded across palm",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_C",
            "title": "Letter C",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 3,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500310/Doodle_Handz_Vector_C_ppldcc.png",
            "instructions": "Curve hand to form a C shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_D",
            "title": "Letter D",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 4,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500311/Doodle_Handz_Vector_D_npbxed.png",
            "instructions": "Touch thumb to middle and ring fingers, index finger points up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_E",
            "title": "Letter E",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 5,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500312/Doodle_Handz_Vector_E_ihxsb8.png",
            "instructions": "Curl all fingers down to touch thumb",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_F",
            "title": "Letter F",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 6,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500313/Doodle_Handz_Vector_F_vwsbjd.png",
            "instructions": "Touch thumb and index finger together, other three fingers up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_G",
            "title": "Letter G",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 7,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500313/Doodle_Handz_Vector_G_p8bxry.png",
            "instructions": "Point index finger and thumb horizontally, like a gun shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_H",
            "title": "Letter H",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 8,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500313/Doodle_Handz_Vector_H_rkmklg.png",
            "instructions": "Extend index and middle fingers horizontally, thumb holds other fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_I",
            "title": "Letter I",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 9,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500313/Doodle_Handz_Vector_I_mztu1s.png",
            "instructions": "Make a fist with pinky finger extended up",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_J",
            "title": "Letter J",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 10,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500313/Doodle_Handz_Vector_J_jydbux.png",
            "instructions": "Make letter I, then draw a J shape in the air",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_K",
            "title": "Letter K",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 11,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500314/Doodle_Handz_Vector_K_hktqrl.png",
            "instructions": "Index finger up, middle finger angled out, thumb between them",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_L",
            "title": "Letter L",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 12,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500315/Doodle_Handz_Vector_L_qu4bjx.png",
            "instructions": "Extend index finger up and thumb out, forming an L",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_M",
            "title": "Letter M",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 13,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500315/Doodle_Handz_Vector_M_rz4o20.png",
            "instructions": "Make a fist with thumb under first three fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_N",
            "title": "Letter N",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 14,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500315/Doodle_Handz_Vector_N_l2qe5m.png",
            "instructions": "Make a fist with thumb under first two fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_O",
            "title": "Letter O",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 15,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500315/Doodle_Handz_Vector_O_hho7ta.png",
            "instructions": "Curve all fingers to meet thumb, forming an O shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_P",
            "title": "Letter P",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 16,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_P_xoafvu.png",
            "instructions": "Like K, but angled downward",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Q",
            "title": "Letter Q",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 17,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_Q_jdnnq3.png",
            "instructions": "Like G, but angled downward",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_R",
            "title": "Letter R",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 18,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_R_zfpcfp.png",
            "instructions": "Cross index finger over middle finger, other fingers down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_S",
            "title": "Letter S",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 19,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_S_iozk2w.png",
            "instructions": "Make a fist with thumb across the front of fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_T",
            "title": "Letter T",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 20,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_T_t2bl2c.png",
            "instructions": "Make a fist with thumb between index and middle fingers",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_U",
            "title": "Letter U",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 21,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500307/Doodle_Handz_Vector_U_cpwjwz.png",
            "instructions": "Extend index and middle fingers up together, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_V",
            "title": "Letter V",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 22,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500308/Doodle_Handz_Vector_V_flsmg0.png",
            "instructions": "Extend index and middle fingers up in a V, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_W",
            "title": "Letter W",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 23,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500309/Doodle_Handz_Vector_W_w1vf5p.png",
            "instructions": "Extend index, middle, and ring fingers up, others down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_X",
            "title": "Letter X",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 24,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500309/Doodle_Handz_Vector_X_ljlaj4.png",
            "instructions": "Make a fist with index finger bent in a hook shape",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Y",
            "title": "Letter Y",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 25,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500309/Doodle_Handz_Vector_Y_qkybj4.png",
            "instructions": "Extend thumb and pinky out, other fingers down",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        },{
            "lesson_id": "alpha_Z",
            "title": "Letter Z",
            "category": "alphabet",
            "difficulty": "beginner",
            "order": 26,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1760500310/Doodle_Handz_Vector_Z_k3v7xo.png",
            "instructions": "Point index finger and draw a Z shape in the air",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
        ,{
            "lesson_id": "num_0",
            "title": "Number 0",
            "category": "Number",
            "difficulty": "beginner",
            "order": 1,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251483/0_V_fhyrus.png",
            "instructions": "Make an “O” with your hand with your thumb touching your fingers.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
        ,{
            "lesson_id": "num_1",
            "title": "Number 1",
            "category": "Number",
            "difficulty": "beginner",
            "order": 2,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/7_V_oh0xsq.png",
            "instructions": "Index finger up, palm facing you.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
         ,{
            "lesson_id": "num_2",
            "title": "Number 2",
            "category": "Number",
            "difficulty": "beginner",
            "order": 3,

            "image_url": "imageURL",
            "instructions": "Index and middle finger up (peace sign), palm facing you.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_3",
            "title": "Number 3",
            "category": "Number",
            "difficulty": "beginner",
            "order": 4,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/3_V_ywdyy5.png",
            "instructions": "Thumb, index and middle finger up, palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_4",
            "title": "Number 4",
            "category": "Number",
            "difficulty": "beginner",
            "order": 5,

            "image_url": "imageURL",
            "instructions": "All fingers except thumb up. Palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_5",
            "title": "Number 5",
            "category": "Number",
            "difficulty": "beginner",
            "order": 6,

            "image_url": "imageURL",
            "instructions": "All five fingers up, relaxed, palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_6",
            "title": "Number 6",
            "category": "Number",
            "difficulty": "beginner",
            "order": 7,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/6_V_mkh5si.png",
            "instructions": "Thumb touches pinky. Other fingers up. Palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_7",
            "title": "Number 7",
            "category": "Number",
            "difficulty": "beginner",
            "order": 8,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/7_V_oh0xsq.png",
            "instructions": "Thumb touches ring finger. Others up. Palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_8",
            "title": "Number 8",
            "category": "Number",
            "difficulty": "beginner",
            "order": 9,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/8_V_shte2k.png",
            "instructions": "Thumb touches middle finger. Others up. Palm out.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        } ,{
            "lesson_id": "num_9",
            "title": "Number 9",
            "category": "Number",
            "difficulty": "beginner",
            "order": 10,

            "image_url": "https://res.cloudinary.com/djwjohaap/image/upload/v1763251400/9_V_vs5c9f.png",
            "instructions": "Thumb touches index finger (like the “perfect/OK” sign). Other fingers up.",

            "passing_accuracy": 75,
            "gained_XP": 10,

            "is_active": True

        }
    ]
    for lesson in lessons:
        try: 
            client.collection('lessons').document(lesson['lesson_id']).set(lesson)
            print(f"lesson created: {lesson['title']}")
        except Exception as e:
            print(f"failed to created lesson {lesson['title']}")
if __name__ == "__main__":
    setup()
    
