import React from 'react';
import './BrandsStrip.css';

const BrandsStrip = ({ brands }) => {
  return (
    <section className="brands-strip">
      <div className="brands-track">
        {brands.map((brand, idx) => <span key={idx}>{brand}</span>)}
      </div>
    </section>
  );
};

export default BrandsStrip;