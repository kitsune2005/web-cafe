import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import data from "../../data/data.json";

import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import ScrollTop from "../../ScrollTop/ScrollTop.jsx";

import "./ProductsPage.css";

const ProductsPage = () => {
  // ==============================
  // STATE
  // ==============================

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // list | grid-2 | grid-3
  const [viewMode, setViewMode] = useState("grid-3");

  const itemsPerPage = 12;

  // ==============================
  // CHUYỂN GIÁ THÀNH NUMBER
  // ==============================

  const getPriceNumber = (price) => {
    if (typeof price === "number") {
      return price;
    }

    return Number(String(price).replace(/[^\d]/g, ""));
  };

  // ==============================
  // ĐẾM SỐ SẢN PHẨM THEO DANH MỤC
  // ==============================

  const categoryCounts = useMemo(() => {
    const counts = {};

    data.products.forEach((product) => {
      counts[product.category] =
        (counts[product.category] || 0) + 1;
    });

    return counts;
  }, []);

  // ==============================
  // LỌC DANH MỤC
  // ==============================

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categorySlug)) {
        return prev.filter(
          (category) => category !== categorySlug
        );
      }

      return [...prev, categorySlug];
    });

    setCurrentPage(1);
  };

  // ==============================
  // LỌC + SẮP XẾP
  // ==============================

  const filteredProducts = useMemo(() => {
    let result = [...data.products];

    // Lọc danh mục
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Giá thấp -> cao
    if (sortType === "price-low") {
      result.sort(
        (a, b) =>
          getPriceNumber(a.price) -
          getPriceNumber(b.price)
      );
    }

    // Giá cao -> thấp
    if (sortType === "price-high") {
      result.sort(
        (a, b) =>
          getPriceNumber(b.price) -
          getPriceNumber(a.price)
      );
    }

    // Tên A -> Z
    if (sortType === "name-az") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name, "vi")
      );
    }

    return result;
  }, [selectedCategories, sortType]);

  // ==============================
  // PHÂN TRANG
  // ==============================

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentProducts =
    filteredProducts.slice(
      startIndex,
      endIndex
    );

  const displayStart =
    filteredProducts.length === 0
      ? 0
      : startIndex + 1;

  const displayEnd =
    Math.min(
      endIndex,
      filteredProducts.length
    );

  // ==============================
  // THÊM GIỎ HÀNG
  // ==============================

  const handleAddToCart = (product) => {
    const oldCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct =
      oldCart.find(
        (item) => item.id === product.id
      );

    let newCart;

    if (existingProduct) {
      newCart = oldCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      newCart = [
        ...oldCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  // ==============================
  // CHUYỂN TRANG
  // ==============================

  const changePage = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 180,
      behavior: "smooth",
    });
  };

  return (
    <div className="products-page">

      <Header />

      <main>

        {/* =========================
            BREADCRUMB
        ========================== */}

        <section className="product-breadcrumb">
          <div className="container">

            <Link to="/">
              TRANG CHỦ
            </Link>

            <i className="fa-solid fa-chevron-right"></i>

            <strong>
              SẢN PHẨM
            </strong>

          </div>
        </section>

        {/* =========================
            SHOP
        ========================== */}

        <section className="shop-section">

          <div className="container">

            {/* =========================
                TOOLBAR
            ========================== */}

            <div className="shop-toolbar">

              <div className="toolbar-left">

                {/* Ẩn / hiện sidebar */}

                <button
                  type="button"
                  onClick={() =>
                    setSidebarVisible(
                      !sidebarVisible
                    )
                  }
                >

                  {sidebarVisible
                    ? "Ẩn thanh bên"
                    : "Hiện thanh bên"}

                  <i className="fa-solid fa-bars-staggered"></i>

                </button>

                {/* Sắp xếp */}

                <select
                  value={sortType}
                  onChange={(e) => {
                    setSortType(
                      e.target.value
                    );

                    setCurrentPage(1);
                  }}
                >

                  <option value="default">
                    Mặc định
                  </option>

                  <option value="price-low">
                    Giá thấp đến cao
                  </option>

                  <option value="price-high">
                    Giá cao đến thấp
                  </option>

                  <option value="name-az">
                    Tên A - Z
                  </option>

                </select>

              </div>

              {/* =========================
                  VIEW MODE
              ========================== */}

              <div className="toolbar-view">

                {/* DANH SÁCH */}

                <button
                  type="button"
                  className={
                    viewMode === "list"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setViewMode("list")
                  }
                  title="Hiển thị danh sách"
                >

                  <i className="fa-solid fa-list"></i>

                </button>

                {/* 2 CỘT */}

                <button
                  type="button"
                  className={
                    viewMode === "grid-2"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setViewMode("grid-2")
                  }
                  title="Hiển thị 2 cột"
                >

                  <i className="fa-solid fa-table-cells-large"></i>

                </button>

                {/* 3 CỘT */}

                <button
                  type="button"
                  className={
                    viewMode === "grid-3"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setViewMode("grid-3")
                  }
                  title="Hiển thị 3 cột"
                >

                  <i className="fa-solid fa-grip"></i>

                </button>

              </div>

            </div>

            {/* =========================
                SỐ KẾT QUẢ
            ========================== */}

            <div className="result-count">

              Hiển thị {displayStart}–{displayEnd}
              {" "}của{" "}
              {filteredProducts.length} kết quả

            </div>

            {/* =========================
                SHOP LAYOUT
            ========================== */}

            <div
              className={`shop-layout ${
                !sidebarVisible
                  ? "sidebar-hidden"
                  : ""
              }`}
            >

              {/* =========================
                  SIDEBAR
              ========================== */}

              {sidebarVisible && (

                <aside className="shop-sidebar">

                  <div className="sidebar-block">

                    <h3>
                      DANH MỤC
                    </h3>

                    {data.categories.map(
                      (category) => (

                        <label
                          key={category.id}
                        >

                          <span>

                            <input
                              type="checkbox"
                              checked={
                                selectedCategories.includes(
                                  category.slug
                                )
                              }
                              onChange={() =>
                                handleCategoryChange(
                                  category.slug
                                )
                              }
                            />

                            {category.name}

                          </span>

                          <span>
                            (
                            {categoryCounts[
                              category.slug
                            ] || 0}
                            )
                          </span>

                        </label>

                      )
                    )}

                  </div>

                </aside>

              )}

              {/* =========================
                  PRODUCTS
              ========================== */}

              <div
                className={`shop-products ${viewMode}`}
              >

                {currentProducts.length > 0 ? (

                  currentProducts.map(
                    (product) => (

                      <article
                        className="shop-product-card"
                        key={product.id}
                      >

                        {/* IMAGE */}

                        <div className="shop-product-image">

                          {/* DISCOUNT */}

                          {product.discount && (

                            <span className="discount-badge">

                              -{product.discount}%

                            </span>

                          )}

                          {/* ẢNH TRƯỚC */}

                          <img
                            className="front"
                            src={
                              product.imageFront
                            }
                            alt={
                              product.name
                            }
                          />

                          {/* ẢNH SAU */}

                          <img
                            className="back"
                            src={
                              product.imageBack ||
                              product.imageFront
                            }
                            alt={`${product.name} mặt sau`}
                          />

                          {/* ACTION */}

                          <div className="product-hover-actions">

                            {/* Yêu thích */}

                            <button
                              type="button"
                              title="Yêu thích"
                            >

                              <i className="fa-regular fa-heart"></i>

                            </button>

                            {/* Xem chi tiết */}

                            <Link
                              to={`/product/${product.id}`}
                              title="Xem chi tiết"
                            >

                              <i className="fa-regular fa-eye"></i>

                            </Link>

                            {/* Giỏ hàng */}

                            <button
                              type="button"
                              title="Thêm vào giỏ"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                            >

                              <i className="fa-solid fa-cart-shopping"></i>

                            </button>

                          </div>

                        </div>

                        {/* =========================
                            PRODUCT INFO
                        ========================== */}

                        <div className="shop-product-info">

                          {/* ĐÁNH GIÁ */}

                          <div className="shop-rating">

                            {[...Array(5)].map(
                              (_, index) => (

                                <i
                                  key={index}
                                  className={
                                    index <
                                    Number(
                                      product.rating
                                    )
                                      ? "fa-solid fa-star"
                                      : "fa-regular fa-star"
                                  }
                                ></i>

                              )
                            )}

                          </div>

                          {/* TÊN */}

                          <h3>
                            {product.name}
                          </h3>

                          {/* GIÁ */}

                          <div className="shop-price">

                            {product.oldPrice && (

                              <del>
                                {product.oldPrice}
                              </del>

                            )}

                            <span>
                              {product.price}
                            </span>

                          </div>

                        </div>

                      </article>

                    )
                  )

                ) : (

                  <div className="no-products">

                    Không tìm thấy sản phẩm.

                  </div>

                )}

              </div>

            </div>

            {/* =========================
                PHÂN TRANG
            ========================== */}

            {totalPages > 1 && (

              <div className="pagination">

                {/* TRƯỚC */}

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    changePage(
                      currentPage - 1
                    )
                  }
                >

                  <i className="fa-solid fa-chevron-left"></i>

                </button>

                {/* SỐ TRANG */}

                {[...Array(totalPages)].map(
                  (_, index) => {

                    const page =
                      index + 1;

                    return (

                      <button
                        type="button"
                        key={page}
                        className={
                          currentPage === page
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          changePage(page)
                        }
                      >

                        {page}

                      </button>

                    );
                  }
                )}

                {/* SAU */}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    changePage(
                      currentPage + 1
                    )
                  }
                >

                  <i className="fa-solid fa-chevron-right"></i>

                </button>

              </div>

            )}

          </div>

        </section>

      </main>

      <Footer />

      <ScrollTop />

    </div>
  );
};

export default ProductsPage;