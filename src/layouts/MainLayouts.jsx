import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const MainLayouts = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Nơi các trang HomePage, CartPage... sẽ xuất hiện */}
      </main>
      <Footer />
    </>
  );
};

export default MainLayouts;