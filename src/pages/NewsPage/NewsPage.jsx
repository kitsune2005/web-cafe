import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useNews } from "../../context/NewsContext";

import "./NewsPage.css";

const NewsPage = () => {
  const { newsList, loading } = useNews();

  //   THÊM STATE QUẢN LÝ PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Tối đa 9 bài một trang

  // Cuộn lên đầu trang khi vừa vào
  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const publishedNews = safeNewsList.filter(news => news.status === "published");

  //   THUẬT TOÁN CẮT MẢNG THEO SỐ TRANG
  const totalPages = Math.ceil(publishedNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = publishedNews.slice(startIndex, startIndex + itemsPerPage);

  // Hàm chuyển trang kèm hiệu ứng cuộn mượt
  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: "smooth" }); // Cuộn vừa qua cái Banner
  };

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#6f4323', fontWeight: 'bold'}}>
        <i className="fa-solid fa-spinner fa-spin"></i> Đang tải tin tức...
      </div>
    );
  }

  return (
    <div className="news-page-wrapper">
        
        {/* =========================================
           BANNER TRANG TIN TỨC
        ========================================= */}
        <div className="news-hero-banner">
            <h1>Tin Tức</h1>
            <p>Cập nhật những câu chuyện, kiến thức và thông tin mới nhất về cà phê.</p>
            <div className="news-breadcrumb">
                <Link to="/">Trang chủ</Link> / <span>Tin tức</span>
            </div>
        </div>

        {/* =========================================
           DANH SÁCH BÀI VIẾT (GRID 3 CỘT)
        ========================================= */}
        <div className="news-page-container">
            <div className="news-grid">

                {currentNews.length === 0 ? (
                    <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888', padding: '40px' }}>
                        Hiện tại chưa có bài viết nào được đăng.
                    </p>
                ) : (
                    currentNews.map(news => (
                        <Link to={`/news/${news.id}`} className="news-card" key={news.id}>
                            <div className="news-card-img">
                                <img 
                                    src={news.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                                    alt={news.title} 
                                />
                            </div>

                            <div className="news-card-body">
                                <h3 className="news-card-title">{news.title}</h3>
                                <p className="news-card-excerpt">{news.excerpt}</p>
                                
                                <span className="news-card-readmore">
                                    Đọc thêm <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </div>
                        </Link>
                    ))
                )}

            </div>

            {/* =========================================
               THANH PHÂN TRANG (PAGINATION)
            ========================================= */}
            {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '50px' }}>
                    <button 
                        type="button" 
                        disabled={currentPage === 1} 
                        onClick={() => changePage(currentPage - 1)}
                    >
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

                    <button 
                        type="button" 
                        disabled={currentPage === totalPages} 
                        onClick={() => changePage(currentPage + 1)}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>

    </div>
  );
};

export default NewsPage;