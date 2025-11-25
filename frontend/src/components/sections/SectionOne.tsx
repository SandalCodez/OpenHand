import PixelPick from "../../app/pages/Home/animationHomePage/PixelPick";

// components/sections/SectionOne.tsx
export default function SectionOne() {
  return (
    <section
      className="bg-custom-color-dark text-white border border-white"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <div className="container-fluid p-0">
        <div className="row g-0">

          {/* BOX 1 — PHOTO ONLY (top-left) */}
          <div className="col-12 col-md-6 border border-white d-flex align-items-center justify-content-center"
            style={{ minHeight: "50vh" }}>
            <div className="w-100 h-100 p-5 d-flex align-items-center justify-content-center">

              <PixelPick
                firstContent={
                  <img
                    src="HandLandMark.png"
                    alt="Letter A!"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                }
                secondContent={
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "#111"
                    }}
                  >
                    <img src="mascot-smiling.png" alt="Mascot Smiling" style={{ maxWidth: '400px', height: '400px' }} />
                    <p style={{ fontWeight: 900, fontSize: "8rem", color: "#ffffff" }}>Hi!</p>
                  </div>
                }
                gridSize={20}
                pixelColor='#00a6ffff'
                animationStepDuration={0.2}
                className="custom-pixel-card"
              />
            </div>
          </div>

          {/* BOX 2 — TEXT ONLY (top-right) */}
          <div className="col-12 col-md-6 border border-white d-flex align-items-center"
            style={{ minHeight: "50vh" }}>
            <div className="w-100 h-100 p-5 d-flex flex-column justify-content-center">
              <h2 className="fw-semibold mb-3">Seamless Communication</h2>
              <p className="text-white-50 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut dolor eu eros imperdiet tempus non non est.
              </p>
              <p className="text-white-50 mb-0">
                Donec commodo, metus nec fermentum ultricies, ex nibh placerat neque, vel porttitor orci lorem a est.
              </p>
              <a className="btn btn-outline-light rounded-pill w-25 mt-3">Learn More</a>
            </div>
          </div>

          {/* BOX 3 — TEXT ONLY (bottom-left) */}
          <div className="col-12 col-md-6 border border-white d-flex align-items-center"
            style={{ minHeight: "50vh" }}>
            <div className="w-100 h-100 p-5 d-flex flex-column justify-content-center">
              <h2 className="fw-semibold mb-3">Smart Learning Tools</h2>
              <p className="text-white-50 mb-3">
                Integer pharetra, felis sit amet maximus dignissim, justo est tempus elit, vitae laoreet ante justo quis magna.
              </p>
              <p className="text-white-50 mb-0">
                Nunc ac velit at ligula sodales rhoncus. Integer iaculis efficitur lectus, vel commodo odio tristique sed.
              </p>
              <a className="btn btn-outline-light rounded-pill w-25 mt-3">Learn More</a>
            </div>
          </div>

          {/* BOX 4 — PHOTO ONLY (bottom-right) */}
          <div className="col-12 col-md-6 border border-white d-flex align-items-center justify-content-center"
            style={{ minHeight: "50vh" }}>
            <div className="w-100 h-100 p-5 d-flex align-items-center justify-content-center">
              <img
                src="logo.png"
                alt="Feature 4"
                className="img-fluid rounded-4 shadow-sm"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
