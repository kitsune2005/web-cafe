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
      behavior: "instant", // Dùng 'instant' để nó nhảy lên ngay lập tức, không bị trượt giật giật
    });
  }, [pathname]);

  // Anh chàng này chỉ làm việc ngầm, không cần vẽ ra giao diện
  return null;
};

export default AutoScrollToTop;