import React, { useRef, useState } from "react";

import { useNews } from "../../../context/NewsContext";

import "./NewsManage.css";

const NewsManage = () => {
  const {
    newsList,
    addNews,
    updateNews,
    deleteNews,
    loading
  } = useNews();

  const fileRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Thông báo giống ProductManage
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    author: "Admin",
    status: "published",
    isFeatured: false
  });

  // =========================================
  // TOAST
  // =========================================

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success"
      });
    }, 3000);
  };

  // =========================================
  // THỐNG KÊ
  // =========================================

  const totalNews = newsList.length;

  const publishedCount = newsList.filter(
    item => item.status === "published"
  ).length;

  const draftCount = newsList.filter(
    item => item.status === "draft"
  ).length;

  const featuredCount = newsList.filter(
    item => item.isFeatured
  ).length;

  // =========================================
  // MỞ MODAL THÊM
  // =========================================

  const handleOpenAdd = () => {
    setEditingId(null);

    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      author: "Admin",
      status: "published",
      isFeatured: false
    });

    setIsModalOpen(true);
  };

  // =========================================
  // MỞ MODAL SỬA
  // =========================================

  const handleOpenEdit = (news) => {
    setEditingId(news.id);

    setFormData({
      title: news.title || "",
      excerpt: news.excerpt || "",
      content: news.content || "",
      image: news.image || "",
      author: news.author || "Admin",
      status: news.status || "published",
      isFeatured: news.isFeatured || false
    });

    setIsModalOpen(true);
  };

  // =========================================
  // UPLOAD ẢNH
  // =========================================

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  // =========================================
  // SUBMIT THÊM / SỬA
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return showToast(
        "⚠️ Vui lòng nhập tiêu đề bài viết!",
        "error"
      );
    }

    if (!formData.content.trim()) {
      return showToast(
        "⚠️ Vui lòng nhập nội dung bài viết!",
        "error"
      );
    }

    if (!formData.image) {
      return showToast(
        "⚠️ Vui lòng chọn ảnh cho bài viết!",
        "error"
      );
    }

    try {
      if (editingId) {
        await updateNews({
          ...formData,
          id: editingId
        });

        showToast(
          "✅ Cập nhật tin tức thành công!",
          "success"
        );
      } else {
        await addNews(formData);

        showToast(
          "✅ Thêm tin tức thành công!",
          "success"
        );
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);

      showToast(
        "❌ Không thể lưu tin tức!",
        "error"
      );
    }
  };

  // =========================================
  // XÓA
  // =========================================

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn XÓA bài viết "${title}" không?`
    );

    if (!confirmDelete) return;

    try {
      await deleteNews(id);

      showToast(
        "🗑️ Đã xóa tin tức thành công!",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "❌ Không thể xóa tin tức!",
        "error"
      );
    }
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "vi-VN"
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="news-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        Đang tải tin tức...
      </div>
    );
  }

  return (
    <div className="news-manage-page">

      {/* ==========================
          TOAST
      ========================== */}

      {toast.show && (
        <div
          className={`news-toast ${toast.type}`}
        >
          <i
            className={
              toast.type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check"
            }
          ></i>

          {toast.message}
        </div>
      )}

      {/* ==========================
          CỘT TRÁI
      ========================== */}

      <div className="news-list-section">

        {/* HEADER */}

        <div className="news-page-header">

          <div>
            <h3>
              News List
            </h3>

            <div className="news-breadcrumb">
              Home &gt; News &gt; News list
            </div>
          </div>

          <button
            className="add-news-btn"
            onClick={handleOpenAdd}
          >
            + Thêm Tin Tức
          </button>

        </div>

        {/* ==========================
            NEWS GRID
        ========================== */}

        {newsList.length === 0 ? (

          <div className="news-empty">
            <i className="fa-regular fa-newspaper"></i>

            <h3>
              Chưa có tin tức
            </h3>

            <p>
              Hãy thêm bài viết đầu tiên.
            </p>
          </div>

        ) : (

          <div className="news-list-grid">

            {newsList.map(item => (

              <div
                className="news-manage-card"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="news-card-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <div className="news-no-image">
                      <i className="fa-regular fa-image"></i>
                    </div>
                  )}

                  {/* NỔI BẬT */}

                  {item.isFeatured && (
                    <span className="news-featured-badge">
                      ★ Nổi bật
                    </span>
                  )}

                  {/* STATUS */}

                  <span
                    className={`news-status-badge ${
                      item.status === "published"
                        ? "published"
                        : "draft"
                    }`}
                  >
                    {item.status === "published"
                      ? "Đã đăng"
                      : "Bản nháp"}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="news-card-content">
                  <h4>
                    {item.title}
                  </h4>

                  <p className="news-excerpt">
                    {item.excerpt ||
                      "Chưa có mô tả ngắn cho bài viết này."}
                  </p>

                  <div className="news-card-meta">

                    <span>
                      <i className="fa-regular fa-user"></i>
                      Tác giả: {item.author || "Admin"}
                    </span>

                    <span>
                      <i className="fa-regular fa-calendar"></i>

                      {formatDate(item.createdAt)}
                    </span>

                  </div>

                  {/* ACTION */}

                  <div className="news-card-actions">

                    <button
                      className="news-edit-btn"
                      onClick={() =>
                        handleOpenEdit(item)
                      }
                      title="Chỉnh sửa"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button
                      className="news-delete-btn"
                      onClick={() =>
                        handleDelete(
                          item.id,
                          item.title
                        )
                      }
                      title="Xóa"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ==========================
          CỘT PHẢI - THỐNG KÊ
      ========================== */}

      <div className="news-stats-section">

        {/* TỔNG */}

        <div className="news-stat-card main-stat">
          <p>
            Tổng tin tức
          </p>

          <h2>
            {totalNews}
          </h2>

          <span>
            Bài viết
          </span>

        </div>

        {/* ĐÃ ĐĂNG */}

        <div className="news-stat-card">

          <div className="news-stat-row">

            <div className="news-stat-icon published">
              <i className="fa-solid fa-check"></i>
            </div>

            <div>
              <p>
                Đã đăng
              </p>

              <h3>
                {publishedCount}
              </h3>
            </div>

          </div>

        </div>

        {/* BẢN NHÁP */}

        <div className="news-stat-card">

          <div className="news-stat-row">

            <div className="news-stat-icon draft">
              <i className="fa-solid fa-file-pen"></i>
            </div>

            <div>
              <p>
                Bản nháp
              </p>

              <h3>
                {draftCount}
              </h3>
            </div>

          </div>

        </div>

        {/* NỔI BẬT */}

        <div className="news-stat-card">

          <div className="news-stat-row">

            <div className="news-stat-icon featured">
              <i className="fa-solid fa-star"></i>
            </div>

            <div>
              <p>
                Tin nổi bật
              </p>

              <h3>
                {featuredCount}
              </h3>
            </div>

          </div>

        </div>

      </div>

      {/* ==========================
          MODAL
      ========================== */}

      {isModalOpen && (

        <div className="news-modal-overlay">

          <div className="news-modal">

            <div className="news-modal-header">

              <h2>
                {editingId
                  ? "Chỉnh Sửa Tin Tức"
                  : "Thêm Tin Tức Mới"}
              </h2>

              <button
                type="button"
                className="news-modal-close"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* TIÊU ĐỀ */}

              <div className="news-form-group">
                <label>
                  Tiêu đề bài viết
                </label>

                <input
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      title: e.target.value
                    })
                  }
                />
              </div>

              {/*AUTHOR */}

              <div className="news-form-row">
                  <div className="news-form-group">
                    <label>
                        Tác giả
                    </label>

                    <input
                        type="text"
                        value={formData.author}
                        onChange={e =>
                        setFormData({
                            ...formData,
                            author: e.target.value
                        })
                        }
                    />
                    </div>
              </div>

              {/* MÔ TẢ */}

              <div className="news-form-group">

                <label>
                  Mô tả ngắn
                </label>

                <textarea
                  rows="3"
                  placeholder="Nhập mô tả ngắn..."
                  value={formData.excerpt}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      excerpt:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* CONTENT */}

              <div className="news-form-group">

                <label>
                  Nội dung bài viết
                </label>

                <textarea
                  rows="7"
                  placeholder="Nhập nội dung..."
                  value={formData.content}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      content:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* IMAGE */}

              <div className="news-form-group">

                <label>
                  Ảnh bài viết
                </label>

                <div
                  className="news-image-upload"
                  onClick={() =>
                    fileRef.current.click()
                  }
                >

                  {formData.image ? (

                    <img
                      src={formData.image}
                      alt="Preview"
                    />

                  ) : (

                    <div>
                      <i className="fa-solid fa-cloud-arrow-up"></i>

                      <p>
                        Nhấn để tải ảnh lên
                      </p>
                    </div>

                  )}

                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

              </div>

              {/* STATUS */}

              <div className="news-form-row">

                <div className="news-form-group">

                  <label>
                    Trạng thái
                  </label>

                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        status:
                          e.target.value
                      })
                    }
                  >
                    <option value="published">
                      Đã đăng
                    </option>

                    <option value="draft">
                      Bản nháp
                    </option>
                  </select>

                </div>

                {/* FEATURED */}

                <div className="news-featured-check">

                  <label>

                    <input
                      type="checkbox"
                      checked={
                        formData.isFeatured
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          isFeatured:
                            e.target.checked
                        })
                      }
                    />

                    ⭐ Tin tức nổi bật

                  </label>

                </div>

              </div>

              {/* BUTTON */}

              <div className="news-modal-actions">

                <button
                  type="button"
                  className="news-cancel-btn"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="news-save-btn"
                >
                  {editingId
                    ? "Cập Nhật"
                    : "Tạo Tin Tức"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default NewsManage;