import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { products, formatPrice } = useProduct();
    const navigate = useNavigate();

    // 👉 STATE CHO PHÂN TRANG (15 Sản phẩm/Trang)
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 15;

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentPage(1); // Gõ từ khóa mới thì tự động về trang 1
    }, [query]);

    // Lọc danh sách sản phẩm theo từ khóa
    const filteredProducts = products.filter(p => {
        return p.name.toLowerCase().includes(query.toLowerCase()) || 
               p.category.toLowerCase().includes(query.toLowerCase());
    });

    // 👉 LOGIC TÍNH TOÁN PHÂN TRANG
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Hàm chuyển trang + tự cuộn lên đầu danh sách
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 250, behavior: 'smooth' }); 
    };

    return (
        <div className="search-page">
            {/* BANNER ĐẦU TRANG */}
            <div className="search-banner">
                <div className="container">
                    <h1>Kết quả tìm kiếm: "{query}"</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span> 
                        <Link to="/products">SẢN PHẨM</Link> <span>&gt;</span> 
                        <strong>KẾT QUẢ CHO "{query.toUpperCase()}"</strong>
                    </div>
                </div>
            </div>

            <div className="container search-layout-container">
                {/* CHỈ CÒN 1 CỘT DUY NHẤT Ở GIỮA */}
                <main className="search-results-main">
                    <div className="search-results-topbar">
                        <p>
                            Hiển thị {filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1}–
                            {Math.min(indexOfLastProduct, filteredProducts.length)} của {filteredProducts.length} kết quả
                        </p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="search-no-products">
                            <i className="fa-solid fa-box-open" style={{fontSize: '50px', color: '#ccc', marginBottom: '15px'}}></i>
                            <h3>Không tìm thấy sản phẩm nào phù hợp!</h3>
                            <p>Thử tìm với từ khóa khác nhé Boss.</p>
                        </div>
                    ) : (
                        <>
                            {/* 👉 LƯỚI 3 SẢN PHẨM / HÀNG */}
                            <div className="search-products-grid">
                                {currentProducts.map(product => (
                                    <div className="search-product-card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
                                        {product.discount > 0 && <span className="badge-discount">-{product.discount}%</span>}
                                        <div className="card-img-wrap">
                                            <img src={product.imageFront || product.img} alt={product.name} />
                                        </div>
                                        <div className="card-info">
                                            <div className="stars">
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                            <h4 className="p-name">{product.name}</h4>
                                            <div className="p-prices">
                                                {product.oldPrice > 0 && <span className="old-p">{formatPrice(product.oldPrice)}</span>}
                                                <span className="new-p">{formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 👉 BỘ PHÂN TRANG (PAGINATION) */}
                            {totalPages > 1 && (
                                <div className="search-pagination">
                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === 1} 
                                        onClick={() => paginate(currentPage - 1)}
                                    >
                                        <i className="fa-solid fa-chevron-left"></i>
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button 
                                            key={i + 1} 
                                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => paginate(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === totalPages} 
                                        onClick={() => paginate(currentPage + 1)}
                                    >
                                        <i className="fa-solid fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>

            </div>
        </div>
    );
};

export default SearchPage;