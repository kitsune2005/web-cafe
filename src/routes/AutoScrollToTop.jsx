import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AutoScrollToTop = () => {
  // Bắt tín hiệu mỗi khi đường link (pathname) thay đổi
  const { pathname } = useLocation();

  useEffect(() => {
    // Kéo thanh cuộn lên thẳng trên cùng
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", 
    });
  }, [pathname]);

  return null;
};

export default AutoScrollToTop;