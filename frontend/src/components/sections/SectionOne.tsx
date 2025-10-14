// components/sections/SectionOne.tsx


export default function SectionOne() {
  return (
    <section className="py-5 bg-custom-color-dark" >
      <div className="container">

        {/* first block: image left / text right */}
        <div className="row align-items-center g-5 mb-5">
          <div className="col-md-6">
            <img
              src="/images/example-left.png"
              alt="Feature"
              className="img-fluid rounded-4 shadow-sm border border-secondary-subtle"
            />
          </div>
          <div className="col-md-6 text-white">
            <h2 className="fw-semibold mb-3">Seamless Communication</h2>
            <p className="text-white-50 mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Vestibulum ut dolor eu eros imperdiet tempus non non est.
            </p>
            <p className="text-white-50">
              Donec commodo, metus nec fermentum ultricies, ex nibh placerat
              neque, vel porttitor orci lorem a est.
            </p>
          </div>
        </div>

        {/* second block: image right / text left */}
        <div className="row align-items-center g-5 flex-row-reverse">
          <div className="col-md-6">
            <img
              src="/images/example-right.png"
              alt="Feature"
              className="img-fluid rounded-4 shadow-sm border border-secondary-subtle"
            />
          </div>
          <div className="col-md-6 text-white">
            <h2 className="fw-semibold mb-3">Smart Learning Tools</h2>
            <p className="text-white-50 mb-3">
              Suspendisse potenti. Integer pharetra, felis sit amet maximus
              dignissim, justo est tempus elit, vitae laoreet ante justo quis
              magna.
            </p>
            <p className="text-white-50">
              Nunc ac velit at ligula sodales rhoncus. 
              Integer iaculis efficitur lectus, vel commodo odio tristique sed.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
