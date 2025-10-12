import "./ActionHomePage.css"
import { useOutletContext } from 'react-router-dom';
import {FaBookOpen} from "react-icons/fa"
import Camera from "../../../components/camera/Camera";
export default function ActionHomePage() {
const context = useOutletContext<{ user: any }>(); 
const user = context?.user;
  console.log('Current user in ActionHimePage', user)
  return (
    <div className="row g-0 min-vh-100">
      {/* Left */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center position-relative">
        <img className="handy-position" src='../mascot-smiling.png' alt='Mascot Smiling' style={{ maxWidth: '150px', height: '150px' }} />
        {/* TODO - add users lessons here!*/}
        <a className="btn btn-sm btn-outline-light rounded-pill lesson-button-position"><FaBookOpen></FaBookOpen> Your lesson</a>
        <h1 className="display-6 text-light m-0">your lesson here</h1>
      </div>

      {/* Right */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center  border-start border-1 border-light">
        {/* TODO - add camera here*/}
        <div className=""><Camera></Camera></div>
        
      </div>
    </div>
  );
}
