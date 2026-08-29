import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProduct } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext"; // 👉 THÊM IMPORT GIỎ HÀNG
import "./ProductsPage.css";

const ProductsPage = () => {
  const { products, formatPrice } = useProduct();
  const { addToCart } = useCart(); // 👉 KÉO HÀM THÊM GIỎ HÀNG TỪ CONTEXT

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [viewMode, setViewMode] = useState("grid-3");
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

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((c) => c !== categoryName);
      }
      return [...prev, categoryName];
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
  }, [products, selectedCategories, sortType]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const displayStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, filteredProducts.length);

  // 👉 HÀM THÊM GIỎ HÀNG CÓ HIỆU ỨNG BAY MỚI NHẤT
  const handleAddFromCard = (e, item) => {
    e.preventDefault(); 
    e.stopPropagation(); 

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
                </aside>
              )}

              <div className={`shop-products ${viewMode}`}>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <article className="shop-product-card" key={product.id}>
                      <div className="shop-product-image">
                        {product.discount > 0 && (
                          <span className="discount-badge">-{product.discount}%</span>
                        )}

                        <img
                          className="front"
                          src={product.imageFront || product.img}
                          alt={product.name}
                        />

                        <img
                          className="back"
                          src={product.imageBack || product.imageFront || product.img}
                          alt={`${product.name} mặt sau`}
                        />

                        <div className="product-hover-actions">
                          <button type="button" title="Yêu thích">
                            <i className="fa-regular fa-heart"></i>
                          </button>
                          <Link to={`/product/${product.id}`} title="Xem chi tiết">
                            <i className="fa-regular fa-eye"></i>
                          </Link>
                          {/* 👉 GẮN HÀM MỚI VÀO NÚT NÀY */}
                          <button type="button" title="Thêm vào giỏ" onClick={(e) => handleAddFromCard(e, product)}>
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
                          <Link to={`/product/${product.id}`} style={{color: 'inherit'}}>
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
                          {product.stock === 0 ? (
                            <span style={{ color: '#fa5252' }}>
                              <i className="fa-solid fa-xmark"></i> Hết hàng
                            </span>
                          ) : product.stock <= 5 ? (
                            <span style={{ color: '#fd7e14' }}>
                              <i className="fa-solid fa-triangle-exclamation"></i> Gần hết hàng (còn {product.stock})
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