import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import localData from '../../../data/data.json';
import './PackagedProducts.css';

const PackagedProducts = ({ products: propProducts }) => {
    const trackRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadFallbackData = () => {
            const fallback = propProducts || localData.products || [];
            setProducts(fallback);
        };

        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || data);
                } else {
                    loadFallbackData();
                }
            } catch (error) {
                loadFallbackData();
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [propProducts]);

    // Mỗi khung hiển thị 4 sản phẩm
    const itemsPerPage = 4;
    const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

    const handleNext = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({
                left: containerWidth,
                behavior: 'smooth',
            });
        }
    };

    const handlePrev = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({
                left: -containerWidth,
                behavior: 'smooth',
            });
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

    return (
        <section className="section wave-section packaged-products">
            <svg className="wave wave-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>

            <div className="container">
                {/* TIÊU ĐỀ - Rơi nhẹ từ trên xuống */}
                <div className="section-head center" data-aos="fade-down">
                    <h2 className="section-title">Sản phẩm đóng gói</h2>
                    <p className="section-text">
                        Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!
                    </p>
                </div>

                {/* KHUNG CAROUSEL - Bọc data-aos bên ngoài để tránh lỗi "tàng hình" lúc loading */}
                <div data-aos="fade-up" data-aos-delay="200">
                    {loading ? (
                        <div className="loading-state">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="carousel-wrapper">
                            <div 
                                className="products-track" 
                                ref={trackRef}
                                onScroll={handleScroll}
                            >
                                {products.map((product, index) => (
                                    <article 
                                        className="product-card" 
                                        key={product.id}
                                        /* Từng thẻ bay lên lần lượt (delay cộng dồn 150ms) */
                                        data-aos="fade-up"
                                        data-aos-delay={200 + index * 150}
                                    >
                                        <div className="product-img">
                                            <img 
                                                className="img-main" 
                                                src={product.imageFront || product.image || product.img} 
                                                alt={product.name} 
                                                loading="lazy" 
                                            />
                                            <img 
                                                className="img-hover" 
                                                src={product.imageBack || product.imageFront || product.image || product.img} 
                                                alt={`${product.name} mặt sau`} 
                                                loading="lazy" 
                                            />
                                            <div className="product-actions">
                                                <Link to={`/product/${product.id}`} className="action-btn" aria-label="Xem chi tiết">
                                                    <i className="fa-regular fa-eye"></i>
                                                </Link>
                                                <button className="action-btn" aria-label="Thêm vào giỏ">
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
                                        <p className="price">
                                            {typeof product.price === 'number' 
                                                ? `${product.price.toLocaleString('vi-VN')} đ` 
                                                : product.price}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ĐIỀU HƯỚNG BÊN DƯỚI - Nổi nhẹ lên cuối cùng */}
                <div className="carousel-nav" data-aos="fade-up" data-aos-delay="400">
                    <button className="carousel-btn" onClick={handlePrev} aria-label="Trang trước">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <span className="carousel-counter">
                        {currentPage} / {totalPages}
                    </span>
                    <button className="carousel-btn" onClick={handleNext} aria-label="Trang sau">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <svg className="wave wave-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
            </svg>
        </section>
    );
};

export default PackagedProducts;