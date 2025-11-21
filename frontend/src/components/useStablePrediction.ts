// import { useEffect, useRef } from "react";

// type Prediction = {
//     top: string | null;
//     conf: number | null;
// };

// type Options = {
//     confidenceThreshold?: number;
//     stableFrames?: number;
//     dropoutFrames?: number;
//     onStable: (p: Prediction) => void;
// };

// export function useStablePrediction(
//     input: Prediction | null,
//     { 
//         confidenceThreshold = 0.75,
//         stableFrames = 3,
//         dropoutFrames = 2,
//         onStable 
//     }: Options
// ) {
//     const lastLabel = useRef<string | null>(null);
//     const stableCount = useRef(0);
//     const dropout = useRef(0);

//     useEffect(() => {
//         if (!input) return;

//         const label = input.top;
//         const conf = input.conf ?? 0;

//         // Too low confidence → treat as noise
//         if (!label || conf < confidenceThreshold) {
//             dropout.current++;

//             if (dropout.current > dropoutFrames) {
//                 lastLabel.current = null;
//                 stableCount.current = 0;
//             }
//             return;
//         }

//         dropout.current = 0;

//         if (label === lastLabel.current) {
//             stableCount.current++;
//         } else {
//             lastLabel.current = label;
//             stableCount.current = 1;
//         }

//         if (stableCount.current >= stableFrames) {
//             onStable({ top: label, conf });
//         }
//     }, [input, confidenceThreshold, stableFrames, dropoutFrames, onStable]);
// }
