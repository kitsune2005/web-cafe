import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// Đã giữ nguyên tên file ảnh cũ để không bị báo lỗi
import coffeCup from "../../../assets/img/—Pngtree—flying cup of coffee with_15739217.png";
import localData from '../../../data/data.json'; 
import './PureCoffee.css';

const PureCoffee = ({ categories: propCategories }) => {
    const trackRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Trang hiện tại
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadFallbackData = () => {
            const fallback = propCategories || localData.categories || localData;
            setCategories(fallback);
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.categories || data);
                } else {
                    loadFallbackData();
                }
            } catch (error) {
                loadFallbackData();
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [propCategories]);

    // Mỗi khung nhìn hiển thị 3 items -> tính tổng số trang thực tế
    const itemsPerPage = 3;
    const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;

    // Cuộn sang trang tiếp theo
    const handleNext = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({
                left: containerWidth,
                behavior: 'smooth',
            });
        }
    };

    // Cuộn về trang trước
    const handlePrev = () => {
        if (trackRef.current) {
            const containerWidth = trackRef.current.clientWidth;
            trackRef.current.scrollBy({
                left: -containerWidth,
                behavior: 'smooth',
            });
        }
    };

    // Bắt sự kiện cuộn để tính số trang hiện tại (1, 2,...)
    const handleScroll = () => {
        if (trackRef.current) {
            const scrollLeft = trackRef.current.scrollLeft;
            const containerWidth = trackRef.current.clientWidth;
            
            // Tính vị trí trang hiện tại
            const newPage = Math.round(scrollLeft / containerWidth) + 1;
            if (newPage !== currentPage && newPage <= totalPages) {
                setCurrentPage(newPage);
            }
        }
    };

    return (
        <section className="pure-coffee-section section">
            <div className="container">
                <div className="pure-flex">
                    
                    {/* CỘT TRÁI */}
                    <div className="pure-left">
                        {/* Hiệu ứng trượt từ trái sang */}
                        <div className="pc-left-content" data-aos="fade-right">
                            <h2 className="section-title">CÀ PHÊ NGUYÊN CHẤT</h2>
                            <p className="section-desc">
                                Cà phê nguyên chất được chế biến 100% nguyên chất,
                                không pha trộn với bất kỳ loại hạt cà phê nào khác.
                                Đây là loại cà phê được trồng, thu hoạch và chế biến
                                một cách cẩn thận để giữ nguyên hương vị và chất
                                lượng tốt nhất.
                            </p>
                            <Link to="/products" className="link-arrow">
                                <span>Khám phá</span>
                                <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                        {/* Hiệu ứng phóng to mờ ảo, trễ 200ms */}
                        <div className="pc-image" data-aos="zoom-in" data-aos-delay="200">
                            <img
                                src={coffeCup}
                                alt="Ly cà phê nguyên chất"
                            />
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="pure-right">
                        {/* Hiệu ứng trượt từ phải sang */}
                        <div className="pc-right-header" data-aos="fade-left">
                            <div className="pc-heading">
                                <h3 className="sub-title">THƠM NGON<br />CHẤT LƯỢNG</h3>
                            </div>
                            <div className="pc-text">
                                <p className="sub-desc">
                                    Những hạt cà phê này thường được trồng theo
                                    phương pháp bền vững, không sử dụng hóa chất
                                    độc hại, tôn trọng môi trường và người lao động.
                                </p>
                            </div>
                        </div>

                        {/* ĐÃ FIX: Đưa data-aos ra một div bọc bên ngoài để AOS nhận diện ngay từ đầu */}
                        <div data-aos="fade-up" data-aos-delay="200">
                            {loading ? (
                                <div className="loading-state">Đang tải danh mục...</div>
                            ) : (
                                <div className="pc-categories">
                                    <div 
                                        className="carousel-track" 
                                        ref={trackRef} 
                                        onScroll={handleScroll}
                                    >
                                        {categories.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={`/products?category=${item.slug || item.id}`}
                                                className="category-card"
                                            >
                                                <div className="category-img">
                                                    {item.img || item.image ? (
                                                        <img
                                                            src={item.img || item.image}
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <div className="circle-icon">
                                                            <i className={item.icon || 'fa-solid fa-mug-hot'}></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3>{item.name}</h3>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CỤM ĐIỀU HƯỚNG - Hiệu ứng trượt lên, trễ 300ms */}
                        <div className="carousel-controls" data-aos="fade-up" data-aos-delay="300">
                            <button className="nav-btn" onClick={handlePrev} aria-label="Trang trước">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            
                            <span className="carousel-page">
                                {currentPage} / {totalPages}
                            </span>
                            
                            <button className="nav-btn" onClick={handleNext} aria-label="Trang sau">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default PureCoffee;