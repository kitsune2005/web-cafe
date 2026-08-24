import React, { useState, useEffect } from 'react';
import localData from '../../../data/data.json';
import './BrandsStrip.css';

const BrandsStrip = ({ brands: propBrands }) => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fallbackList = propBrands || localData.brands || [
      "La Croissanterie",
      "Belle Café",
      "THE RISTRETTO",
      "Coffeep",
      "Roses Coffee",
      "DALGONA COFFEE"
    ];
    setBrands(fallbackList);
  }, [propBrands]);

  return (
    <section className="brands-strip">
      <div className="brands-wrapper">
        {/* Nhân bản 2 nhóm liên tiếp để vòng lặp chạy liền mạch không có khoảng trắng */}
        <div className="brands-track">
          <div className="brands-group">
            {brands.map((brand, idx) => (
              <span className="brand-item" key={`b1-${idx}`}>
                {brand}
              </span>
            ))}
          </div>
          <div className="brands-group" aria-hidden="true">
            {brands.map((brand, idx) => (
              <span className="brand-item" key={`b2-${idx}`}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsStrip;