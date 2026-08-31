import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useNews } from "../../context/NewsContext";

import "./NewsPage.css";

const NewsPage = () => {
  const { newsList, loading } = useNews();

  // Cuộn lên đầu trang khi vừa vào
  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  // 👉 BỌC THÉP CHỐNG SẬP TRẮNG TRANG: Ép kiểu mảng an toàn
  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  
  // Chỉ lấy những bài đã đăng
  const publishedNews = safeNewsList.filter(news => news.status === "published");

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

                {publishedNews.length === 0 ? (
                    <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888', padding: '40px' }}>
                        Hiện tại chưa có bài viết nào được đăng.
                    </p>
                ) : (
                    publishedNews.map(news => (
                        /* Bọc Link ra ngoài cùng để bấm vào đâu cũng mở bài viết */
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
        </div>

    </div>
  );
};

export default NewsPage;