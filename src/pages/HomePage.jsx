import React from 'react';
// 1. Dữ liệu tĩnh
import data from '../data/data.json';

// 2. Components dùng chung
// ❌ ĐÃ XÓA IMPORT HEADER & FOOTER VÌ MAINLAYOUTS SẼ LO VIỆC ĐÓ
import ScrollTop from '../ScrollTop/ScrollTop.jsx';

// 3. Components Trang chủ
import Hero from '../components/home/Hero/Hero.jsx';
import Feature from '../components/home/Feature/Feature.jsx';
import BrandsStrip from '../components/home/BrandsStrip/BrandsStrip.jsx';
import PureCoffee from '../components/home/PureCoffee/PureCoffee.jsx';
import PackagedProducts from '../components/home/PackagedProducts/PackagedProducts.jsx';
import BrewSection from '../components/home/BrewSection/BrewSection.jsx';
import Journey from '../components/home/Journey/Journey.jsx';
import Instagram from '../components/home/Instagram/Instagram.jsx';
import Testimonials from '../components/home/Testimonials/Testimonials.jsx';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* ❌ ĐÃ XÓA <Header /> Ở ĐÂY */}
      
      <Hero />
      <PureCoffee categories={data.categories} />
      <PackagedProducts products={data.products} />
      <Feature />
      <Journey steps={data.journey} />
      <BrewSection brews={data.brews} />
      <Testimonials testimonials={data.testimonials} />
      <Instagram images={data.instagram} />
      <BrandsStrip brands={data.brands} />
      
      {/* ❌ ĐÃ XÓA <Footer /> Ở ĐÂY */}
      <ScrollTop />
    </div>
  );
};

export default HomePage;