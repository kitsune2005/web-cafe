import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const MainLayouts = () => {
  return (
    <>
    
      <main>
        <Outlet /> {/* Nơi các trang HomePage, CartPage... sẽ xuất hiện */}
      </main>
    
    </>
  );
};

export default MainLayouts;