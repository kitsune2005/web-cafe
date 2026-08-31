import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useProduct } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import toast from 'react-hot-toast'; 
import "./ProductsPage.css";

const ProductsPage = () => {
  const { products, formatPrice } = useProduct();
  const { addToCart } = useCart();
  const navigate = useNavigate(); 

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [viewMode, setViewMode] = useState("grid-3");
  
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]); 

  const itemsPerPage = 12;

  const getPriceNumber = (price) => {
    if (typeof price === "number") return price;
    return Number(String(price).replace(/[^\d]/g, ""));
  };

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const targetCategories = ['Cà phê nguyên chất', 'Cà phê đóng gói', 'Cà phê phin'];

  const priceRanges = [
    { id: 'under-100', label: 'Dưới 100.000đ', min: 0, max: 100000 },
    { id: '100-300', label: '100.000đ - 300.000đ', min: 100000, max: 300000 },
    { id: '300-500', label: '300.000đ - 500.000đ', min: 300000, max: 500000 },
    { id: 'over-500', label: 'Trên 500.000đ', min: 500000, max: Infinity }
  ];

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((c) => c !== categoryName);
      }
      return [...prev, categoryName];
    });
    setCurrentPage(1);
  };

  const handlePriceChange = (rangeId) => {
    setSelectedPriceRanges((prev) => {
      if (prev.includes(rangeId)) {
        return prev.filter((id) => id !== rangeId);
      }
      return [...prev, rangeId];
    });
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products]; 

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    if (selectedPriceRanges.length > 0) {
        result = result.filter((product) => {
            const pPrice = getPriceNumber(product.price);
            return selectedPriceRanges.some(rangeId => {
                const range = priceRanges.find(r => r.id === rangeId);
                return pPrice >= range.min && pPrice <= range.max;
            });
        });
    }

    if (sortType === "price-low") {
      result.sort((a, b) => getPriceNumber(a.price) - getPriceNumber(b.price));
    }
    if (sortType === "price-high") {
      result.sort((a, b) => getPriceNumber(b.price) - getPriceNumber(a.price));
    }
    if (sortType === "name-az") {
      result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    return result;
  }, [products, selectedCategories, sortType, selectedPriceRanges]);

  const newestProducts = useMemo(() => {
      return [...products].reverse().slice(0, 3);
  }, [products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const displayStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, filteredProducts.length);

  const handleAddFromCard = (e, item) => {
    e.preventDefault(); 
    e.stopPropagation(); // Chặn nút Giỏ hàng chuyển trang

    if ((item.stock || 0) <= 0) {
        toast.error("Món này đang cháy hàng mất rồi Boss ơi! 🦊");
        return;
    }

    const cardElement = e.currentTarget.closest('.shop-product-card');
    const imgElement = cardElement ? cardElement.querySelector('.front') : null;
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

  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  return (
    <div className="products-page">
      <main>
        <section className="product-breadcrumb">
          <div className="container">
            <Link to="/">TRANG CHỦ</Link>
            <i className="fa-solid fa-chevron-right"></i>
            <strong>SẢN PHẨM</strong>
          </div>
        </section>

        <section className="shop-section">
          <div className="container">
            <div className="shop-toolbar">
              <div className="toolbar-left">
                <button type="button" onClick={() => setSidebarVisible(!sidebarVisible)}>
                  {sidebarVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}
                  <i className="fa-solid fa-bars-staggered"></i>
                </button>
                <select value={sortType} onChange={(e) => { setSortType(e.target.value); setCurrentPage(1); }}>
                  <option value="default">Mặc định</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="name-az">Tên A - Z</option>
                </select>
              </div>

              <div className="toolbar-view">
                <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
                  <i className="fa-solid fa-list"></i>
                </button>
                <button type="button" className={viewMode === "grid-2" ? "active" : ""} onClick={() => setViewMode("grid-2")}>
                  <i className="fa-solid fa-table-cells-large"></i>
                </button>
                <button type="button" className={viewMode === "grid-3" ? "active" : ""} onClick={() => setViewMode("grid-3")}>
                  <i className="fa-solid fa-grip"></i>
                </button>
              </div>
            </div>

            <div className="result-count">
              Hiển thị {displayStart}–{displayEnd} của {filteredProducts.length} kết quả
            </div>

            <div className={`shop-layout ${!sidebarVisible ? "sidebar-hidden" : ""}`}>
              
              {sidebarVisible && (
                <aside className="shop-sidebar">
                  <div className="sidebar-block">
                    <h3>DANH MỤC</h3>
                    {targetCategories.map((categoryName) => (
                      <label key={categoryName}>
                        <span>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(categoryName)}
                            onChange={() => handleCategoryChange(categoryName)}
                          />
                          {categoryName}
                        </span>
                        <span>
                          ({categoryCounts[categoryName] || 0})
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="sidebar-block">
                      <h3>MỨC GIÁ</h3>
                      <ul className="filter-list">
                          {priceRanges.map((range) => (
                              <li key={range.id}>
                                  <label>
                                      <span>
                                          <input
                                              type="checkbox"
                                              checked={selectedPriceRanges.includes(range.id)}
                                              onChange={() => handlePriceChange(range.id)}
                                          />
                                          {range.label}
                                      </span>
                                  </label>
                              </li>
                          ))}
                      </ul>
                  </div>

                  <div className="sidebar-block">
                      <h3>SẢN PHẨM MỚI NHẤT</h3>
                      <div className="newest-products-list">
                          {newestProducts.map(prod => (
                              <div key={prod.id} className="mini-product-item" onClick={() => navigate(`/product/${prod.id}`)} style={{ cursor: 'pointer' }}>
                                  <img src={prod.imageFront || prod.img} alt={prod.name} />
                                  <div className="mini-product-info">
                                      <span className="mini-name">{prod.name}</span>
                                      <span className="mini-price">{formatPrice(prod.price)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                </aside>
              )}

              <div className={`shop-products ${viewMode}`}>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <article 
                      className="shop-product-card" 
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="shop-product-image">
                        {product.discount > 0 && (
                          <span className="discount-badge">-{product.discount}%</span>
                        )}

                        <img
                          className="front"
                          src={product.imageFront || product.img}
                          alt={product.name}
                          style={{ filter: (product.stock || 0) <= 0 ? 'grayscale(80%) opacity(0.8)' : 'none' }} 
                        />

                        <img
                          className="back"
                          src={product.imageBack || product.imageFront || product.img}
                          alt={`${product.name} mặt sau`}
                          style={{ filter: (product.stock || 0) <= 0 ? 'grayscale(80%) opacity(0.8)' : 'none' }}
                        />

                        <div className="product-hover-actions">
                          <button type="button" title="Yêu thích" onClick={(e) => e.stopPropagation()}>
                            <i className="fa-regular fa-heart"></i>
                          </button>
                          
                          <Link 
                            to={`/product/${product.id}`} 
                            title="Xem chi tiết"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </Link>
                          
                          <button 
                            type="button" 
                            title={(product.stock || 0) <= 0 ? "Hết hàng" : "Thêm vào giỏ"} 
                            onClick={(e) => handleAddFromCard(e, product)}
                            style={{ 
                                opacity: (product.stock || 0) <= 0 ? 0.5 : 1, 
                                cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer' 
                            }}
                          >
                            <i className="fa-solid fa-cart-shopping"></i>
                          </button>
                        </div>
                      </div>

                      <div className="shop-product-info">
                        <div className="shop-rating">
                          {[...Array(5)].map((_, index) => (
                            <i
                              key={index}
                              className={index < Number(product.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                            ></i>
                          ))}
                        </div>

                        <h3>
                          <Link 
                            to={`/product/${product.id}`} 
                            style={{color: 'inherit'}}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product.name}
                          </Link>
                        </h3>

                        <div className="shop-price">
                          {product.oldPrice && (
                            <del>{formatPrice(product.oldPrice)}</del>
                          )}
                          <span>{formatPrice(product.price)}</span>
                        </div>

                        <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                          {(product.stock || 0) <= 0 ? (
                            <span style={{ color: '#fa5252' }}>
                              <i className="fa-solid fa-xmark"></i> Đã hết hàng
                            </span>
                          ) : (product.stock || 0) <= 5 ? (
                            <span style={{ color: '#fd7e14' }}>
                              <i className="fa-solid fa-triangle-exclamation"></i> Sắp hết (còn {product.stock})
                            </span>
                          ) : (
                            <span style={{ color: '#0ca678' }}>
                              <i className="fa-solid fa-check"></i> Còn hàng
                            </span>
                          )}
                        </div>

                      </div>
                    </article>
                  ))
                ) : (
                  <div className="no-products">Không tìm thấy sản phẩm.</div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      type="button"
                      key={page}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => changePage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductsPage;