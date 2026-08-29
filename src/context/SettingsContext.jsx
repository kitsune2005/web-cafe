import React, { createContext, useState, useEffect, useContext } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [snowEffect, setSnowEffect] = useState(() => JSON.parse(localStorage.getItem('snowEffect')) || false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('snowEffect', JSON.stringify(snowEffect));
  }, [snowEffect]);

  return (
    <SettingsContext.Provider value={{ darkMode, setDarkMode, snowEffect, setSnowEffect }}>
      {children}
      {snowEffect && <SnowAnimation />}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

// ==========================================
// COMPONENT: HIỆU ỨNG TUYẾT RƠI (Đã thêm viền shadow)
// ==========================================
const SnowAnimation = () => {
  const snowflakes = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    animationDuration: `${Math.random() * 3 + 3}s`, 
    animationDelay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.8 + 0.2,
    size: `${Math.random() * 8 + 6}px` 
  }));

  return (
    <div className="snow-overlay">
      {snowflakes.map(snow => (
        <div
          key={snow.id}
          className="snowflake"
          style={{
            left: snow.left,
            animationDuration: snow.animationDuration,
            animationDelay: snow.animationDelay,
            opacity: snow.opacity,
            width: snow.size,
            height: snow.size,
          }}
        ></div>
      ))}
      <style>{`
        .snow-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          pointer-events: none; z-index: 9998; overflow: hidden;
        }
        .snowflake {
          position: absolute; top: -20px; background: #fff; border-radius: 50%;
          /* Thêm bóng đổ đen mờ để nhìn thấy tuyết trên nền trắng */
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.4); 
          filter: blur(0.5px); animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-20px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(50vh) translateX(25px) rotate(180deg); }
          100% { transform: translateY(105vh) translateX(-20px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};