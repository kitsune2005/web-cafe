import React, { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";

// Import thư viện AOS và CSS của nó
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  // Khởi động AOS ngay khi App vừa render lần đầu tiên
  useEffect(() => {
    AOS.init({
      duration: 800,            // Thời gian chạy animation (800ms = 0.8 giây)
      easing: 'ease-out-cubic', // Gia tốc cuộn siêu mượt
      once: true,               // Chỉ chạy hiệu ứng 1 lần khi cuộn xuống
      offset: 50,               // Cách mép dưới màn hình 50px thì bắt đầu hiện
    });
  }, []);

  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
};

export default App;