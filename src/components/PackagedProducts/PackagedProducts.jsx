import React from 'react';
import './PackagedProducts.css';

const PackagedProducts = ({ products }) => {
    return (
        <section className="section wave-section packaged-products">
            <svg className="wave wave-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>
            <div className="container">
                <div className="bean-decor" aria-hidden="true">
                    <img src="./img/—Pngtree—blade shining coffee beans line_6182415.png" alt="decor hạt cà phê" />
                </div>
                <div className="section-head center reveal">
                    <h2 className="section-title">Sản phẩm đóng gói</h2>
                    <p className="section-text">Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!</p>
                </div>
                <div className="carousel" data-visible="4">
                    <div className="carousel-track products-track">
                        {products.map(product => (
                            <article className="product-card reveal" key={product.id}>
                                <div className="product-img">
                                    <img className="img-main" src={product.imageFront} alt="Mặt trước" loading="lazy" />
                                    <img className="img-hover" src={product.imageBack} alt="Mặt sau" loading="lazy" />
                                    <div className="product-actions">
                                        <button className="action-btn" aria-label="Xem nhanh"><i className="fa-regular fa-eye"></i></button>
                                        <button className="action-btn" aria-label="Thêm vào giỏ"><i className="fa-solid fa-cart-shopping"></i></button>
                                    </div>
                                </div>
                                <div className="rating">
                                    {[...Array(product.rating)].map((_, i) => <i className="fa-solid fa-star" key={i}></i>)}
                                </div>
                                <h3>{product.name}</h3>
                                <p className="price">{product.price}</p>
                            </article>
                        ))}
                    </div>
                    <div className="carousel-nav">
                        <button className="carousel-prev"><i className="fa-solid fa-chevron-left"></i></button>
                        <span className="carousel-counter"><span>1</span> / <span>5</span></span>
                        <button className="carousel-next"><i className="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
            <svg className="wave wave-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>
        </section>
    );
};

export default PackagedProducts;