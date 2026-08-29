import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../../../context/ProductContext'; 
import { useCart } from '../../../context/CartContext'; // 👉 THÊM IMPORT
import './PackagedProducts.css';

const PackagedProducts = () => {
    const trackRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const { products, formatPrice, loading } = useProduct();
    const { addToCart } = useCart(); // 👉 KÉO HÀM TỪ CONTEXT

    const displayProducts = products
        .filter(product => product.isFeatured !== false || product.category === 'Cà phê đóng gói')
        .slice(0, 8);

    const itemsPerPage = 4;
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage) || 1;

    const handleNext = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({ left: containerWidth, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({ left: -containerWidth, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (trackRef.current) {
            const scrollLeft = trackRef.current.scrollLeft;
            const containerWidth = trackRef.current.clientWidth;
            const newPage = Math.round(scrollLeft / containerWidth) + 1;
            if (newPage !== currentPage && newPage <= totalPages) {
                setCurrentPage(newPage);
            }
        }
    };

    // 👉 HÀM THÊM GIỎ HÀNG CÓ HIỆU ỨNG BAY MỚI NHẤT
    const handleAddFromCard = (e, item) => {
        e.preventDefault(); 
        e.stopPropagation(); 

        const cardElement = e.currentTarget.closest('.product-card');
        const imgElement = cardElement ? cardElement.querySelector('.img-main') : null;
        const cartIcon = document.querySelector('.cart-btn i'); 

        if (imgElement && cartIcon) {
            const imgRect = imgElement.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();

            const flyingImg = imgElement.cloneNode(true);
            flyingImg.style.position = 'fixed';
            flyingImg.style.zIndex = '999999';
            flyingImg.style.top = `${imgRect.top}px`;
            flyingImg.style.left = `${imgRect.left}px`;
            flyingImg.style.width = `${imgRect.width}px`;
            flyingImg.style.height = `${imgRect.height}px`;
            flyingImg.style.objectFit = 'cover';
            flyingImg.style.borderRadius = '8px';
            flyingImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            flyingImg.style.pointerEvents = 'none';

            document.body.appendChild(flyingImg);

            requestAnimationFrame(() => {
                flyingImg.style.top = `${cartRect.top - 15}px`;
                flyingImg.style.left = `${cartRect.left - 15}px`;
                flyingImg.style.width = '30px';
                flyingImg.style.height = '30px';
                flyingImg.style.opacity = '0.1';
                flyingImg.style.transform = 'scale(0.2)';
            });

            setTimeout(() => {
                flyingImg.remove();
                addToCart(item, 1); 
                
                cartIcon.classList.add('shake-cart-anim');
                setTimeout(() => cartIcon.classList.remove('shake-cart-anim'), 400);
            }, 800);
        } else {
            addToCart(item, 1);
        }
    };

    return (
        <section className="section wave-section packaged-products">
            <svg className="wave wave-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>

            <div className="container">
                <div className="section-head center" data-aos="fade-down">
                    <h2 className="section-title">SẢN PHẨM NỔI BẬT</h2>
                    <p className="section-text">
                        Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!
                    </p>
                </div>

                <div data-aos="fade-up" data-aos-delay="200">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#6f4323' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', marginBottom: '10px' }}></i>
                            <p style={{ fontWeight: 'bold' }}>Đang kết nối Server...</p>
                        </div>
                    ) : displayProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                            Chưa có sản phẩm nổi bật nào ngoài Trang chủ.
                        </div>
                    ) : (
                        <div className="carousel-wrapper">
                            <div className="products-track" ref={trackRef} onScroll={handleScroll}>
                                {displayProducts.map((product, index) => (
                                    <article 
                                        className="product-card" 
                                        key={product.id}
                                        data-aos="fade-up"
                                        data-aos-delay={200 + index * 150}
                                        style={{ position: 'relative' }}
                                    >
                                        {product.discount > 0 && (
                                            <span style={{ position: 'absolute', top: '15px', left: '15px', background: '#ff6b6b', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
                                                -{product.discount}%
                                            </span>
                                        )}

                                        <div className="product-img">
                                            <img className="img-main" src={product.imageFront || product.img} alt={product.name} loading="lazy" />
                                            <img className="img-hover" src={product.imageBack || product.imageFront || product.img} alt={`${product.name} mặt sau`} loading="lazy" />
                                            <div className="product-actions">
                                                <Link to={`/product/${product.id}`} className="action-btn" aria-label="Xem chi tiết">
                                                    <i className="fa-regular fa-eye"></i>
                                                </Link>
                                                {/* 👉 GẮN HÀM MỚI VÀO NÚT NÀY */}
                                                <button className="action-btn" aria-label="Thêm vào giỏ" onClick={(e) => handleAddFromCard(e, product)}>
                                                    <i className="fa-solid fa-cart-shopping"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rating">
                                            {[...Array(Number(product.rating) || 5)].map((_, i) => (
                                                <i className="fa-solid fa-star" key={i}></i>
                                            ))}
                                        </div>

                                        <h3>{product.name}</h3>
                                        
                                        <p className="price" style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                                            {product.oldPrice && product.discount > 0 ? (
                                                <>
                                                    <del style={{ color: '#aaa', fontSize: '14px' }}>{formatPrice(product.oldPrice)}</del>
                                                    <span style={{ color: '#b23a2c', fontWeight: 'bold' }}>{formatPrice(product.price)}</span>
                                                </>
                                            ) : (
                                                <span style={{ color: '#b23a2c', fontWeight: 'bold' }}>{formatPrice(product.price)}</span>
                                            )}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="carousel-nav" data-aos="fade-up" data-aos-delay="400">
                        <button className="carousel-btn" onClick={handlePrev} disabled={currentPage === 1}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <span className="carousel-counter">
                            {currentPage} / {totalPages}
                        </span>
                        <button className="carousel-btn" onClick={handleNext} disabled={currentPage === totalPages}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>

            <svg className="wave wave-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>
        </section>
    );
};

export default PackagedProducts;