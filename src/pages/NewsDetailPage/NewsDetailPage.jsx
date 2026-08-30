import React from "react";
import { Link, useParams } from "react-router-dom";

import { useNews } from "../../context/NewsContext";

import "./NewsDetailPage.css";

const NewsDetailPage = () => {
  const { id } = useParams();

  const {
    newsList,
    loading
  } = useNews();

  // URL trả id dạng string nên phải Number
  const news = newsList.find(
    (item) => item.id === Number(id)
  );
  const otherNews = newsList
  .filter(
    (item) =>
      item.id !== Number(id) &&
      item.status === "published"
  )
  .slice(0, 3);
  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="news-detail-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>

        <span>
          Đang tải bài viết...
        </span>
      </div>
    );
  }

  // ============================
  // KHÔNG TÌM THẤY
  // ============================

  if (!news) {
    return (
      <div className="news-detail-not-found">

        <i className="fa-regular fa-newspaper"></i>

        <h1>
          Không tìm thấy bài viết
        </h1>

        <p>
          Bài viết này có thể đã bị xóa
          hoặc không tồn tại.
        </p>

        <Link to="/news">
          Quay lại Tin tức
        </Link>

      </div>
    );
  }

  // ============================
  // NGÀY
  // ============================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  };

  return (
    <div className="news-detail-page">

      {/* ============================
          HERO
      ============================ */}

      <section
        className="news-detail-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0, 0, 0, 0.58),
              rgba(0, 0, 0, 0.72)
            ),
            url("${news.image}")
          `
        }}
      >

        <div className="news-detail-hero-content">

          <h1>
            {news.title}
          </h1>

          {/* META */}

          <div className="news-detail-meta">

            <span>
              <i className="fa-regular fa-user"></i>

              {news.author || "Admin"}
            </span>

            <span>
              <i className="fa-regular fa-calendar"></i>

              {formatDate(news.createdAt)}
            </span>

          </div>

          {/* BREADCRUMB */}

          <div className="news-detail-breadcrumb">

            <Link to="/">
              Trang chủ
            </Link>

            <span>/</span>

            <Link to="/news">
              Tin tức
            </Link>

            <span>/</span>

            <span className="current">
              {news.title}
            </span>

          </div>

        </div>

      </section>


      {/* ============================
          CONTENT
      ============================ */}

      <section className="news-detail-section">

        <div className="news-detail-container">

          {/* QUAY LẠI */}

          <Link
            to="/news"
            className="back-news"
          >
            <i className="fa-solid fa-arrow-left"></i>

            Quay lại Tin tức
          </Link>


          {/* ARTICLE */}
            
          <article className="news-detail-article">

            {/* MÔ TẢ NGẮN */}

            {news.excerpt && (
              <p className="news-detail-excerpt">
                <b>{news.excerpt}</b>
              </p>
            )}


            {/* ẢNH */}

            {news.image && (
              <div className="news-detail-main-image">

                <img
                  src={news.image}
                  alt={news.title}
                />

              </div>
            )}


            {/* NỘI DUNG */}

            <div className="news-detail-content">

              {news.content}

            </div>


            {/* FOOTER */}

            <div className="news-detail-footer">

              <div>
                <span>
                  Người viết:
                </span>

                <strong>
                  {news.author || "Admin"}
                </strong>
              </div>

              {news.updatedAt && (
                <div>
                  <span>
                    Cập nhật:
                  </span>

                  <strong>
                    {formatDate(news.updatedAt)}
                  </strong>
                </div>
              )}

            </div>

          </article>
          {/* =================================
            BÀI VIẾT KHÁC
            ================================= */}

         {otherNews.length > 0 && (
         <section className="other-news-section">

            <div className="other-news-heading">

            <div>
                <span className="other-news-small">
                CÓ THỂ BẠN QUAN TÂM
                </span>

                <h2>
                Bài viết khác
                </h2>
            </div>

            <Link
                to="/news"
                className="view-all-news"
            >
                Xem tất cả

                <i className="fa-solid fa-arrow-right"></i>
            </Link>

            </div>


            <div className="other-news-grid">

            {otherNews.map((item) => (

                <article
                className="other-news-card"
                key={item.id}
                >

                {/* ẢNH */}

                <Link
                    to={`/news/${item.id}`}
                    className="other-news-image"
                >
                    <img
                    src={item.image}
                    alt={item.title}
                    />

                    {item.isFeatured && (
                    <span className="other-news-featured">
                        Nổi bật
                    </span>
                    )}
                </Link>


                {/* NỘI DUNG */}

                <div className="other-news-content">

                    <div className="other-news-meta">

                    <span>
                        <i className="fa-regular fa-calendar"></i>

                        {formatDate(item.createdAt)}
                    </span>

                    <span>
                        <i className="fa-regular fa-user"></i>

                        {item.author || "Admin"}
                    </span>

                    </div>


                    <h3>

                    <Link
                        to={`/news/${item.id}`}
                    >
                        {item.title}
                    </Link>

                    </h3>


                    <p>
                    {item.excerpt ||
                        "Khám phá thêm những thông tin thú vị về cà phê."}
                    </p>


                    <Link
                    to={`/news/${item.id}`}
                    className="other-news-readmore"
                    >
                    Đọc thêm

                    <i className="fa-solid fa-arrow-right"></i>
                    </Link>

                </div>

                </article>

            ))}

            </div>

        </section>
        )}    
        </div>

      </section>

    </div>
  );
};

export default NewsDetailPage;