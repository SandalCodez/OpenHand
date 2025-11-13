import { useNavigate } from "react-router-dom";

export default function usePageLeaveAnimation() {
  const navigate = useNavigate();

  const goWithAnimation = (path: string, animateFn: () => void) => {
    animateFn();                   // play animation
    setTimeout(() => navigate(path), 300);  // wait then navigate
  };

  return goWithAnimation;
}
