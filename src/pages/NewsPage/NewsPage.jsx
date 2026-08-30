import React from "react";
import { useParams, Link } from 'react-router-dom';
import { useNews } from "../../context/NewsContext";

import "./NewsPage.css";

const NewsPage = () => {
  const {
    newsList,
    loading
  } = useNews();

  const publishedNews =
    newsList.filter(
      news =>
        news.status === "published"
    );

  if (loading) {
    return (
      <div className="news-loading">
        Đang tải tin tức...
      </div>
    );
  }

  return (
    <div className="news-page">
        <section className="news-hero">
            <div className="news-hero-overlay"></div>

            <div className="news-hero-content">
                <h1>Tin Tức</h1>

                <p>
                Cập nhật những câu chuyện, kiến thức và thông tin mới nhất về cà phê.
                </p>

                <div className="news-breadcrumb">
                <Link to="/">Trang chủ</Link>

                <span>/</span>

                <span className="current">Tin tức</span>
                </div>
            </div>
        </section>
        <section className="news-section">

            <div className="container">

            <div className="news-grid">

                {publishedNews.map(news => (
                <article
                    className="news-card"
                    key={news.id}
                >

                    <Link
                    to={`/news/${news.id}`}
                    className="news-card-image"
                    >
                    <img
                        src={news.image}
                        alt={news.title}
                    />
                    </Link>

                    <div className="news-content">

                    <h2>
                        <Link
                        to={`/news/${news.id}`}
                        className="news-title-link"
                        >
                        {news.title}
                        </Link>
                    </h2>

                    <p>
                        {news.excerpt}
                    </p>

                    <Link
                        to={`/news/${news.id}`}
                        className="read-more"
                    >
                        Đọc thêm

                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>

                    </div>

                </article>
                ))}

            </div>

            </div>

        </section>
    </div>
  );
};

export default NewsPage;