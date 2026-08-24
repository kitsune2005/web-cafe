import React from 'react';
// Import dữ liệu trực tiếp từ file JSON (Cách này không bị 404)
import data from '../data/data.json'; 

import Header from '../components/Header/Header.jsx';
import Hero from '../components/Hero/Hero.jsx';
import PureCoffee from '../components/PureCoffee/PureCoffee.jsx';
import PackagedProducts from '../components/PackagedProducts/PackagedProducts.jsx';
import Feature from '../components/Feature/Feature.jsx';
import Journey from '../components/Journey/Journey.jsx';
import BrewSection from '../components/BrewSection/BrewSection.jsx';
import Testimonials from '../components/Testimonials/Testimonials.jsx';
import Instagram from '../components/Instagram/Instagram.jsx';
import BrandsStrip from '../components/BrandsStrip/BrandsStrip.jsx';
import Footer from '../components/Footer/Footer.jsx';
import ScrollTop from '../components/ScrollTop/ScrollTop.jsx';

const HomePage = () => {
  // Dữ liệu đã được import trực tiếp, không cần useState hay useEffect fetch
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <PureCoffee categories={data.categories} />
      <PackagedProducts products={data.products} />
      <Feature />
      <Journey steps={data.journey} />
      <BrewSection brews={data.brews} />
      <Testimonials testimonials={data.testimonials} />
      <Instagram images={data.instagram} />
      <BrandsStrip brands={data.brands} />
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default HomePage;