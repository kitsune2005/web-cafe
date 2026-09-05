import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useNews } from "../../context/NewsContext";
import "./NewsDetailPage.css";

const NewsDetailPage = () => {
  const { id } = useParams();
  const { newsList, loading } = useNews();

  // URL trả id dạng string nên phải Number
  const news = newsList.find((item) => String(item.id) === String(id));
  
  //   THUẬT TOÁN: RANDOM NHƯNG ƯU TIÊN BÀI MỚI NHẤT
  const otherNews = [...newsList]
    // 1. Loại bỏ bài đang đọc và chỉ lấy bài đã xuất bản
    .filter((item) => String(item.id) !== String(id) && item.status === "published")
    // 2. Trộn ngẫu nhiên một chút (Tạo tính Random)
    .sort(() => 0.5 - Math.random())
    // 3. Xếp lại ưu tiên bài mới nhất (So sánh thời gian tạo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    // 4. Bốc đúng 3 bài đầu tiên
    .slice(0, 3);

  // Cuộn lên đầu trang khi chuyển bài
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ============================
  // HÀM CHUYỂN ĐỔI LINK YOUTUBE
  // ============================
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // ============================
  // LOADING & KHÔNG TÌM THẤY
  // ============================
  if (loading) {
    return (
      <div className="news-detail-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Đang tải bài viết...</span>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-not-found">
        <i className="fa-regular fa-newspaper"></i>
        <h1>Không tìm thấy bài viết</h1>
        <p>Bài viết này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/news">Quay lại Tin tức</Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="news-detail-page">

      {/* ============================
          HERO BANNER
      ============================ */}
      <section
        className="news-detail-hero"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.72)),
            url("${news.image || ''}")
          `
        }}
      >
        <div className="news-detail-hero-content">
          <h1>{news.title}</h1>
          <div className="news-detail-meta">
            <span><i className="fa-regular fa-user"></i> {news.author || "Admin"}</span>
            <span><i className="fa-regular fa-calendar"></i> {formatDate(news.createdAt)}</span>
          </div>
          <div className="news-detail-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/news">Tin tức</Link>
            <span>/</span>
            <span className="current">{news.title}</span>
          </div>
        </div>
      </section>

      {/* ============================
          CONTENT ARTICLE
      ============================ */}
      <section className="news-detail-section">
        <div className="news-detail-container">
          
          <Link to="/news" className="back-news">
            <i className="fa-solid fa-arrow-left"></i> Quay lại Tin tức
          </Link>

          <article className="news-detail-article">
            
            {/* ĐOẠN MỞ BÀI IN ĐẬM */}
            {news.excerpt && (
              <p className="news-detail-excerpt">
                <b>{news.excerpt}</b>
              </p>
            )}

            {/* HỆ THỐNG HIỂN THỊ NỘI DUNG BLOCK BUILDER */}
            <div className="news-detail-content">
              
              {/* Nếu là bài cũ (chưa dùng block) thì vẫn hiển thị bình thường */}
              {(!news.contentBlocks || news.contentBlocks.length === 0) && news.content && (
                  news.content.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
              )}

              {/* Nếu là bài mới dùng Block Builder */}
              {news.contentBlocks && news.contentBlocks.map((block) => {
                  
                  // 1. Dành cho Block Chữ
                  if (block.type === 'text') {
                      return (
                          <div key={block.id} style={{ marginBottom: '20px' }}>
                              {block.value.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                          </div>
                      );
                  }

                  // 2. Dành cho Block Ảnh + Chú thích
                  if (block.type === 'image') {
                      return (
                          <figure key={block.id} style={{ margin: '35px 0', textAlign: 'center' }}>
                              <img 
                                  src={block.url} 
                                  alt={block.caption || 'Hình ảnh bài viết'} 
                                  style={{ width: '100%', borderRadius: '8px', maxHeight: '550px', objectFit: 'cover' }} 
                              />
                              {block.caption && (
                                  <figcaption style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginTop: '12px', background: '#f9f9f9', display: 'inline-block', padding: '8px 20px', borderRadius: '4px' }}>
                                      {block.caption}
                                  </figcaption>
                              )}
                          </figure>
                      );
                  }

                  // 3. Dành cho Block Video Youtube
                  if (block.type === 'video') {
                      const embedUrl = getYoutubeEmbedUrl(block.url);
                      return (
                          <figure key={block.id} style={{ margin: '35px 0', textAlign: 'center' }}>
                              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                  <iframe 
                                      src={embedUrl} 
                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                                      frameBorder="0" 
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                  ></iframe>
                              </div>
                              {block.caption && (
                                  <figcaption style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginTop: '12px' }}>
                                      {block.caption}
                                  </figcaption>
                              )}
                          </figure>
                      );
                  }

                  return null;
              })}
            </div>

            {/* FOOTER BÀI VIẾT */}
            <div className="news-detail-footer">
              <div>
                <span>Người viết:</span>
                <strong>{news.author || "Admin"}</strong>
              </div>
              {news.updatedAt && (
                <div>
                  <span>Cập nhật:</span>
                  <strong>{formatDate(news.updatedAt)}</strong>
                </div>
              )}
            </div>

          </article>

          {/* =================================
              BÀI VIẾT KHÁC (CÓ THỂ BẠN QUAN TÂM)
          ================================= */}
          {otherNews.length > 0 && (
            <section className="other-news-section">
              <div className="other-news-heading">
                <div>
                  <span className="other-news-small">CÓ THỂ BẠN QUAN TÂM</span>
                  <h2>Bài viết khác</h2>
                </div>
                <Link to="/news" className="view-all-news">
                  Xem tất cả <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>

              <div className="other-news-grid">
                {otherNews.map((item) => (
                  <article className="other-news-card" key={item.id}>
                    <Link to={`/news/${item.id}`} className="other-news-image">
                      <img src={item.image} alt={item.title} />
                      {item.isFeatured && <span className="other-news-featured">Nổi bật</span>}
                    </Link>

                    <div className="other-news-content">
                      <div className="other-news-meta">
                        <span><i className="fa-regular fa-calendar"></i> {formatDate(item.createdAt)}</span>
                        <span><i className="fa-regular fa-user"></i> {item.author || "Admin"}</span>
                      </div>
                      <h3>
                        <Link to={`/news/${item.id}`}>{item.title}</Link>
                      </h3>
                      <p>{item.excerpt || "Khám phá thêm những thông tin thú vị về cà phê."}</p>
                      <Link to={`/news/${item.id}`} className="other-news-readmore">
                        Đọc thêm <i className="fa-solid fa-arrow-right"></i>
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