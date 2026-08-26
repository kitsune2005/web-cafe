import React, { useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";

// QUAN TRỌNG: import Router
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";

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
      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

      </Routes>
    </AuthProvider>
  );
};

export default App;