export const GESTURE_MAP: Record<string, string> = {
"0":"ALL DONE",
  "1":"BALL",
  "2":"BATH",
  "3":"BOOK",
  "4":"DAD",
  "5":"DIAPER",
  "6":"DOG",
  "7":"DRINK",
  "8":"EAT",
  "9":"HELP",
  "10":"HEY, KEEP IT PG!",
  "11":"LOVE YOU",
  "12":"MILK",
  "13":"MOM",
  "14":"MORE",
  "15":"MUSIC",
  "16":"PLAY",
  "17":"PLEASE",
  "18":"SLEEP",
  "19":"SORRY",
  "20":"THANK YOU"
};
export function getGestureName(index: string | number): string {
  const key = String(index);
  return GESTURE_MAP[key] || key; // fallback to index if not found
}