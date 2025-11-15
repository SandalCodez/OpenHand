// DownMascotAnimation.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./MainMascotAnimation.module.css";

export type DownMascotAnimationProps = {
  size?: number;    // px
  paused?: boolean; // pause all animations
  speed?: number;   // blink speed multiplier (1 = normal)
};

const DownMascotAnimation: React.FC<DownMascotAnimationProps> = ({
  size = 300,
  paused = false,
  speed = 1,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Smoothed mouse target (normalized -1..1)
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    const onMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;  // 0..1
      const my = (e.clientY - rect.top) / rect.height;  // 0..1
      targetRef.current.x = (mx - 0.5) * 2;
      targetRef.current.y = (my - 0.5) * 2;
    };

    const onLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const loop = () => {
      // Lerp towards target for smooth follow
      const k = 0.075;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * k;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * k;

      // Clamp and scale to pixel range the pupils can travel
      const maxX = 5; // px horizontal travel
      const maxY = 4; // px vertical travel
      const px = Math.max(-1, Math.min(1, currentRef.current.x)) * maxX;
      const py = Math.max(-1, Math.min(1, currentRef.current.y)) * maxY;

      // Push into CSS vars
      wrap!.style.setProperty("--look-x", `${px}px`);
      wrap!.style.setProperty("--look-y", `${py}px`);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const styleVars: React.CSSProperties = {
    ["--speed" as any]: String(speed),
  };

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${paused ? styles.paused : ""}`}
      style={{ width: size, height: size, ...styleVars }}
      role="img"
      aria-label="Down mascot animation"
    >
      <svg
        ref={svgRef}
        className={`${styles.stage} ${styles.float}`}
        viewBox="0 0 600 800"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <g className={styles.head}>
          {/* ====== DEFS (from your SVG, unchanged) ====== */}
          <defs>
            <clipPath id="07d50fb102"><path d="M 337.023438 170.066406 L 450.273438 170.066406 L 450.273438 283.316406 L 337.023438 283.316406 Z M 337.023438 170.066406 " clipRule="nonzero"/></clipPath>
            <clipPath id="eef4ab5a33"><path d="M 148.21875 170.066406 L 261.46875 170.066406 L 261.46875 283.316406 L 148.21875 283.316406 Z M 148.21875 170.066406 " clipRule="nonzero"/></clipPath>
            <clipPath id="8d382980f5"><path d="M 157.773438 177.101562 L 253.660156 177.101562 L 253.660156 273.101562 L 157.773438 273.101562 Z M 157.773438 177.101562 " clipRule="nonzero"/></clipPath>
            <clipPath id="4cce623cb4"><path d="M 346.039062 177.101562 L 442.332031 177.101562 L 442.332031 273.101562 L 346.039062 273.101562 Z M 346.039062 177.101562 " clipRule="nonzero"/></clipPath>
            <clipPath id="2f872b3f8e"><path d="M 1 1 L 452.441406 1 L 452.441406 447.761719 L 1 447.761719 Z M 1 1 " clipRule="nonzero"/></clipPath>
            <clipPath id="fd090ba269"><rect x="0" width="453" y="0" height="448"/></clipPath>
            <clipPath id="016cdb72e6"><path d="M 255.484375 294.304688 L 344.734375 294.304688 L 344.734375 331 L 255.484375 331 Z M 255.484375 294.304688 " clipRule="nonzero"/></clipPath>
            {/* --- small round eye clips (needed for blinking) --- */}
            <clipPath id="dm-0ccbd762e9"><rect x="0" y="0" width="33" height="33"/></clipPath>
            <clipPath id="dm-e0c8fce3bd">
            <path d="M 0.261719 0.683594 L 32.164062 0.683594 L 32.164062 32.589844 L 0.261719 32.589844 Z"/>
            </clipPath>
            <clipPath id="dm-35ca4a9957">
            <path d="M 16.214844 0.683594 C 7.402344 0.683594 0.261719 7.828125 0.261719 16.636719 
                    C 0.261719 25.445312 7.402344 32.589844 16.214844 32.589844 
                    C 25.023438 32.589844 32.164062 25.445312 32.164062 16.636719 
                    C 32.164062 7.828125 25.023438 0.683594 16.214844 0.683594 Z"/>
            </clipPath>

            <clipPath id="dm-3343fa2286"><rect x="0" y="0" width="33" height="33"/></clipPath>
            <clipPath id="dm-ce71e5f2c2">
            <path d="M 0.824219 0.683594 L 32.730469 0.683594 L 32.730469 32.589844 L 0.824219 32.589844 Z"/>
            </clipPath>
            <clipPath id="dm-b5e30c05b4">
            <path d="M 16.777344 0.683594 C 7.96875 0.683594 0.824219 7.828125 0.824219 16.636719 
                    C 0.824219 25.445312 7.96875 32.589844 16.777344 32.589844 
                    C 25.585938 32.589844 32.730469 25.445312 32.730469 16.636719 
                    C 32.730469 7.828125 25.585938 0.683594 16.777344 0.683594 Z"/>
            </clipPath>
                    
          </defs>

          
          {/* ====== OUTER RINGS (unchanged visual) ====== */}
          <g clipPath="url(#07d50fb102)">
            <path fill="#ffffffff" d="M 150.636719 226.859375 ... 50.636719 226.859375 Z" />
          </g>
          <g clipPath="url(#eef4ab5a33)">
            <path fill="#ffffff" d="M 261.835938 226.859375 ... 261.835938 226.859375 Z" />
          </g>


          {/* ================= LEFT EYE ================= */}
          {/* We blink the WHOLE eye (black + white) together; pupils (white shapes) move inside. */}
          <g className={`${styles.pupil} ${styles.eyeball}`}>
            {/* Black eye base */}
            <g clipPath="url(#8d382980f5)">
              <path
                fill="#ff8896ff"
                d="M 253.625 225.113281 C 253.625 251.625 232.167969 273.125 205.699219 273.125 C 179.230469 273.125 157.773438 251.625 157.773438 225.113281 C 157.773438 198.597656 179.230469 177.101562 205.699219 177.101562 C 232.167969 177.101562 253.625 198.597656 253.625 225.113281 "
              />
            </g>

            {/* Pupils / highlights (move with mouse) */}
            <path
              className={`${styles.pupil} ${styles.eyeball}`}
              fill="#b0ebffff"
              d="M 216.683594 218.109375 C 216.683594 229.160156 207.742188 238.117188 196.714844 238.117188 C 185.683594 238.117188 176.742188 229.160156 176.742188 218.109375 C 176.742188 207.0625 185.683594 198.105469 196.714844 198.105469 C 207.742188 198.105469 216.683594 207.0625 216.683594 218.109375 "
            />
            <path
              className={`${styles.pupil} ${styles.eyeball}`}
              fill="#ffffff"
              d="M 231.65625 248.117188 C 231.65625 253.640625 227.1875 258.121094 221.675781 258.121094 C 216.160156 258.121094 211.6875 253.640625 211.6875 248.117188 C 211.6875 242.59375 216.160156 238.117188 221.675781 238.117188 C 227.1875 238.117188 231.65625 242.59375 231.65625 248.117188 "
            />
          </g>

          {/* ================= RIGHT EYE ================= */}
          <g className={`${styles.pupil} ${styles.eyeball}`}>
            {/* Black eye base */}
            <g clipPath="url(#4cce623cb4)">
              <path
                fill="#ff8896ff"
                d="M 442.332031 225.113281 C 442.332031 251.625 420.875 273.125 394.40625 273.125 C 367.9375 273.125 346.480469 251.625 346.480469 225.113281 C 346.480469 198.597656 367.9375 177.101562 394.40625 177.101562 C 420.875 177.101562 442.332031 198.597656 442.332031 225.113281 "
              />
            </g>

            {/* Pupils / highlights */}
            <path
              className={`${styles.pupil} ${styles.eyeball}`}
              fill="#b0ebffff"
              d="M 405.386719 218.109375 C 405.386719 229.160156 396.445312 238.117188 385.421875 238.117188 C 374.390625 238.117188 365.449219 229.160156 365.449219 218.109375 C 365.449219 207.0625 374.390625 198.105469 385.421875 198.105469 C 396.445312 198.105469 405.386719 207.0625 405.386719 218.109375 "
            />
            <path
              className={`${styles.pupil} ${styles.eyeball}`}
              fill="#ffffff"
              d="M 420.367188 248.117188 C 420.367188 253.640625 415.894531 258.121094 410.382812 258.121094 C 404.867188 258.121094 400.394531 253.640625 400.394531 248.117188 C 400.394531 242.59375 404.867188 238.117188 410.382812 238.117188 C 415.894531 238.117188 420.367188 242.59375 420.367188 248.117188 "
            />
          </g>

          {/* ====== BODY / FACE (unchanged) ====== */}
          <g transform="matrix(1, 0, 0, 1, 71, 86)">
            <g clipPath="url(#fd090ba269)">
              <g clipPath="url(#2f872b3f8e)">
                <path
                  fill="#b0ebffff"
                  d="M 424.816406 305.804688 C 420.636719 308.066406 409.742188 311.933594 405.226562 311.933594 L 261.726562 311.933594 C 275.75 352.515625 267.421875 408.917969 231.28125 435.507812 C 210.617188 450.707031 171.953125 453.929688 154.859375 431.949219 C 140.867188 413.960938 151.136719 401.566406 152.414062 382.359375 C 153.335938 368.46875 144.890625 351.292969 140 338.089844 C 129.195312 308.925781 114.070312 261.058594 92.816406 239.144531 C 76.222656 222.035156 46.0625 237.339844 25.761719 226.699219 C 10.835938 218.875 3.144531 200.40625 2.171875 184.242188 C -0.554688 139.042969 4.289062 91.140625 2.175781 45.660156 C 4.296875 21.804688 22.222656 3.617188 46.300781 2.109375 C 67.929688 0.753906 96.421875 1.21875 118.25 2.113281 C 131.316406 2.644531 144.488281 4.722656 157.21875 7.566406 C 169.644531 10.347656 176.34375 14.167969 189.964844 11.914062 C 206.234375 9.222656 222.75 2.945312 239.8125 2.726562 C 281.773438 3.632812 326.660156 -0.449219 368.425781 2.113281 C 400.234375 4.0625 423.542969 31.125 418.882812 63.140625 C 417.816406 70.46875 414.246094 75.023438 419.289062 82.179688 C 420.421875 83.785156 422.429688 85.039062 423.617188 86.617188 C 432.398438 98.246094 437.660156 111.429688 436.484375 126.335938 C 435.988281 132.628906 431.890625 141.199219 432.550781 146.644531 C 433.210938 152.105469 438.535156 156.175781 441.414062 160.589844 C 450.933594 175.1875 452.535156 194.011719 446.128906 210.214844 C 444.058594 215.457031 439.632812 220.179688 440.625 226.265625 C 442.992188 231.726562 446.820312 236.171875 449.054688 241.796875 C 458.597656 265.863281 447.148438 293.722656 424.816406 305.804688 Z M 411.570312 237.78125 C 405.566406 235.039062 395.035156 234.710938 395.539062 225.699219 C 395.972656 218.027344 406.710938 215.722656 411.898438 211.636719 C 427.613281 199.261719 426.539062 174.128906 408.25 165.117188 C 404.886719 163.460938 398.796875 162.753906 396.363281 160.34375 C 395.667969 159.652344 394.605469 157.707031 394.441406 156.714844 C 393.285156 149.679688 398.875 147.171875 402.578125 142.699219 C 413.8125 129.125 413.09375 107.410156 397.15625 97.886719 C 391.335938 94.410156 381.347656 94.65625 379.492188 87.496094 C 377.617188 80.261719 384.132812 77.449219 387.640625 72.816406 C 394.226562 64.109375 395.164062 52.003906 391.011719 42.074219 C 385.722656 29.425781 374.652344 23.984375 361.410156 23.15625 C 326.75 20.992188 289.875 24.847656 254.980469 23.15625 C 233.753906 22.648438 214.261719 29.28125 194.042969 32.945312 C 170.6875 37.175781 146.605469 25.550781 122.3125 23.769531 C 101.105469 22.214844 70.992188 21.710938 49.816406 23.15625 C 34.222656 24.21875 23.808594 33.234375 22.636719 49.167969 C 24.8125 92.617188 19.820312 138.769531 22.628906 181.902344 C 24.722656 214.035156 55.1875 204.03125 77.304688 205.554688 C 109.09375 207.746094 124.691406 235.222656 136.15625 261.269531 C 150.664062 294.222656 162.128906 328.589844 175.820312 361.890625 C 176.753906 365.582031 177.871094 369.820312 178.132812 373.605469 C 179.441406 392.710938 163.382812 420.734375 194.222656 422.980469 C 226.601562 425.335938 244.453125 390.109375 247.105469 362.488281 C 249.230469 340.375 241.945312 320.03125 235.402344 299.335938 C 235.160156 293.492188 239.691406 287.738281 245.628906 287.359375 L 399.375 287.375 C 427.371094 287.371094 438.34375 250 411.570312 237.78125 Z"
                />
              </g>
            </g>
          </g>

          {/* ====== SAD MOUTH (hover reactive like the smile) ====== */}
          <g className={styles.smileWrap}>
            <path
              className={styles.smile} /* reuse the same hover scale */
              fill="#ffffff"
              d="M 299.894531 294.375 C 302.792969 294.371094 305.699219 294.636719 308.554688 295.167969 C 322.230469 297.707031 334.222656 306.300781 341.019531 318.429688 C 342.097656 320.355469 343.042969 322.359375 343.84375 324.417969 C 344.730469 326.703125 343.597656 329.277344 341.3125 330.164062 C 339.027344 331.050781 336.453125 329.917969 335.566406 327.632812 C 331.140625 316.234375 321.367188 307.476562 309.515625 304.449219 C 309.296875 304.398438 309.082031 304.332031 308.867188 304.25 C 305.355469 303.464844 302.011719 303.132812 298.660156 303.238281 C 298.65625 303.238281 298.65625 303.238281 298.652344 303.238281 C 296.234375 303.3125 293.988281 303.601562 291.597656 304.140625 L 291.421875 304.199219 C 291.292969 304.242188 291.164062 304.277344 291.035156 304.308594 C 278.972656 307.144531 268.917969 316.140625 264.425781 327.640625 C 263.535156 329.925781 260.957031 331.054688 258.675781 330.160156 C 256.390625 329.269531 255.261719 326.695312 256.152344 324.410156 C 260.644531 312.914062 269.695312 303.273438 281.023438 298.308594 C 286.957031 295.707031 293.421875 294.382812 299.894531 294.375 Z"
            />
            {/* circle to show on hover */}
            <circle className={styles.smileCircle} cx="299.5" cy="298.3" r="26" fill="#ffffffff" />
          </g>
          
        </g>
        {/* ====== FLYING SPEED LINES ====== */}
          <g className={styles.trails} aria-hidden="true" transform="translate(0, 200)">
            {/* Centered under the mascot; super thin white lines */}
            {/* Use vectorEffect to keep 1px visually consistent */}
            <line x1="280" y1="380" x2="280" y2="415" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.9" className={styles.trail} />
            <line x1="300" y1="385" x2="300" y2="430" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" className={styles.trail} />
            <line x1="320" y1="380" x2="320" y2="410" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.85" className={styles.trail} />
            <line x1="260" y1="392" x2="260" y2="430" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.75" className={styles.trail} />
            <line x1="340" y1="392" x2="340" y2="428" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.75" className={styles.trail} />
            <line x1="290" y1="410" x2="290" y2="450" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.7" className={styles.trail} />
            <line x1="310" y1="408" x2="310" y2="452" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.7" className={styles.trail} />
            <line x1="270" y1="420" x2="270" y2="465" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.65" className={styles.trail} />
            <line x1="330" y1="420" x2="330" y2="465" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.65" className={styles.trail} />
            <line x1="250" y1="430" x2="250" y2="480" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" className={styles.trail} />
            <line x1="350" y1="430" x2="350" y2="480" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" className={styles.trail} />
            <line x1="300" y1="440" x2="300" y2="500" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.55" className={styles.trail} />
          </g>

      </svg>
    </div>
  );
};

export default DownMascotAnimation;
