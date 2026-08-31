import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProduct } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import "./ProductsPage.css";

const ProductsPage = () => {
  const { products, formatPrice } = useProduct();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 992);
  const [viewMode, setViewMode] = useState("grid-3");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  const itemsPerPage = 12;

  // Tự động ẩn/hiện sidebar theo kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) setSidebarVisible(true);
      else setSidebarVisible(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chuẩn hóa giá về dạng number để so sánh/sắp xếp
  const getPriceNumber = (price) => {
    if (typeof price === "number") return price;
    return Number(String(price).replace(/[^\d]/g, ""));
  };

  // Đếm số lượng sản phẩm theo từng danh mục (hiển thị cạnh checkbox)
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const targetCategories = ["Cà phê nguyên chất", "Cà phê đóng gói", "Cà phê phin"];

  const priceRanges = [
    { id: "under-100", label: "Dưới 100.000đ", min: 0, max: 100000 },
    { id: "100-300", label: "100.000đ - 300.000đ", min: 100000, max: 300000 },
    { id: "300-500", label: "300.000đ - 500.000đ", min: 300000, max: 500000 },
    { id: "over-500", label: "Trên 500.000đ", min: 500000, max: Infinity },
  ];

  // Chọn/bỏ chọn danh mục lọc
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName]
    );
    setCurrentPage(1);
  };

  // Chọn/bỏ chọn khoảng giá lọc
  const handlePriceChange = (rangeId) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((id) => id !== rangeId) : [...prev, rangeId]
    );
    setCurrentPage(1);
  };

  // Lọc + sắp xếp danh sách sản phẩm theo danh mục, khoảng giá và kiểu sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter((product) => {
        const pPrice = getPriceNumber(product.price);
        return selectedPriceRanges.some((rangeId) => {
          const range = priceRanges.find((r) => r.id === rangeId);
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

  // Lấy 3 sản phẩm mới nhất hiển thị ở sidebar
  const newestProducts = useMemo(() => {
    return [...products].reverse().slice(0, 3);
  }, [products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const displayStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, filteredProducts.length);

  // Thêm vào giỏ hàng kèm hiệu ứng bay ảnh sản phẩm vào icon giỏ hàng
  const handleAddFromCard = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if ((item.stock || 0) <= 0) {
      toast.error("Món này đang cháy hàng mất rồi Boss ơi!");
      return;
    }

    const cardElement = e.currentTarget.closest(".shop-product-card");
    const imgElement = cardElement ? cardElement.querySelector(".front") : null;
    const cartIcon = document.querySelector(".cart-btn i");

    if (imgElement && cartIcon) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const flyingImg = imgElement.cloneNode(true);
      flyingImg.style.position = "fixed";
      flyingImg.style.zIndex = "999999";
      flyingImg.style.top = `${imgRect.top}px`;
      flyingImg.style.left = `${imgRect.left}px`;
      flyingImg.style.width = `${imgRect.width}px`;
      flyingImg.style.height = `${imgRect.height}px`;
      flyingImg.style.objectFit = "cover";
      flyingImg.style.borderRadius = "8px";
      flyingImg.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      flyingImg.style.pointerEvents = "none";

      document.body.appendChild(flyingImg);

      requestAnimationFrame(() => {
        flyingImg.style.top = `${cartRect.top - 15}px`;
        flyingImg.style.left = `${cartRect.left - 15}px`;
        flyingImg.style.width = "30px";
        flyingImg.style.height = "30px";
        flyingImg.style.opacity = "0.1";
        flyingImg.style.transform = "scale(0.2)";
      });

      setTimeout(() => {
        flyingImg.remove();
        addToCart(item, 1);
        cartIcon.classList.add("shake-cart-anim");
        setTimeout(() => cartIcon.classList.remove("shake-cart-anim"), 400);
      }, 800);
    } else {
      addToCart(item, 1);
    }
  };

  // Chuyển trang và cuộn lên đầu danh sách sản phẩm
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
                <button type="button" className="btn-toggle-sidebar" onClick={() => setSidebarVisible(!sidebarVisible)}>
                  <i className="fa-solid fa-filter"></i>
                  <span className="desktop-text">{sidebarVisible ? "Ẩn thanh bên" : "Hiện thanh bên"}</span>
                  <span className="mobile-text">Bộ lọc sản phẩm</span>
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
              {/* Sidebar bộ lọc: danh mục, khoảng giá, sản phẩm mới nhất */}
              {sidebarVisible && (
                <aside className="shop-sidebar">
                  <button className="close-sidebar-mobile" onClick={() => setSidebarVisible(false)}>
                    <i className="fa-solid fa-xmark"></i> Đóng bộ lọc
                  </button>

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
                        <span>({categoryCounts[categoryName] || 0})</span>
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
                      {newestProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="mini-product-item"
                          onClick={() => navigate(`/product/${prod.id}`)}
                          style={{ cursor: "pointer" }}
                        >
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

              {/* Danh sách sản phẩm hiển thị theo chế độ xem (list / grid-2 / grid-3) */}
              <div className={`shop-products ${viewMode}`}>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    // flex column để phần nút hành động luôn nằm sát đáy card
                    <article
                      className="shop-product-card"
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
                    >
                      <div className="shop-product-image">
                        {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
                        <img
                          className="front"
                          src={product.imageFront || product.img}
                          alt={product.name}
                          style={{ filter: (product.stock || 0) <= 0 ? "grayscale(80%) opacity(0.8)" : "none" }}
                        />
                        <img
                          className="back"
                          src={product.imageBack || product.imageFront || product.img}
                          alt={`${product.name} mặt sau`}
                          style={{ filter: (product.stock || 0) <= 0 ? "grayscale(80%) opacity(0.8)" : "none" }}
                        />
                      </div>

                      <div className="shop-product-info" style={{ flex: 1 }}>
                        <div className="shop-rating">
                          {[...Array(5)].map((_, index) => (
                            <i
                              key={index}
                              className={index < Number(product.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                            ></i>
                          ))}
                        </div>
                        <h3>
                          <Link to={`/product/${product.id}`} style={{ color: "inherit" }} onClick={(e) => e.stopPropagation()}>
                            {product.name}
                          </Link>
                        </h3>
                        <div className="shop-price">
                          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
                          <span>{formatPrice(product.price)}</span>
                        </div>
                        <div className="shop-stock-status">
                          {(product.stock || 0) <= 0 ? (
                            <span style={{ color: "#fa5252" }}><i className="fa-solid fa-xmark"></i> Đã hết</span>
                          ) : (product.stock || 0) <= 5 ? (
                            <span style={{ color: "#fd7e14" }}><i className="fa-solid fa-triangle-exclamation"></i> Sắp hết</span>
                          ) : (
                            <span style={{ color: "#0ca678" }}><i className="fa-solid fa-check"></i> Còn hàng</span>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động nhanh: yêu thích / xem chi tiết / thêm vào giỏ */}
                      <div className="product-hover-actions">
                        <button type="button" title="Yêu thích" onClick={(e) => e.stopPropagation()}>
                          <i className="fa-regular fa-heart"></i>
                        </button>

                        <Link to={`/product/${product.id}`} title="Xem chi tiết" onClick={(e) => e.stopPropagation()}>
                          <i className="fa-regular fa-eye"></i>
                        </Link>

                        <button
                          type="button"
                          title={(product.stock || 0) <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                          onClick={(e) => handleAddFromCard(e, product)}
                          style={{
                            opacity: (product.stock || 0) <= 0 ? 0.5 : 1,
                            cursor: (product.stock || 0) <= 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          <i className="fa-solid fa-cart-shopping"></i>
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="no-products">Không tìm thấy sản phẩm.</div>
                )}
              </div>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button type="button" key={page} className={currentPage === page ? "active" : ""} onClick={() => changePage(page)}>
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