import React, { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";

// GỌI APP ROUTES VÀO ĐÂY (Nó sẽ thay thế toàn bộ <Routes> cũ)
import AppRoutes from "./routes/AppRoutes";

// AOS
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <AuthProvider>
      {/* Vứt bỏ <Routes> cũ đi, chỉ cần gọi một dòng này thôi */}
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;