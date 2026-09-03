import React, { useRef, useState } from "react";
import { useNews } from "../../../context/NewsContext";
import Swal from 'sweetalert2';
import "./NewsManage.css";

const NewsManage = () => {
  const { newsList, addNews, updateNews, deleteNews, loading } = useNews();
  const fileCoverRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    title: "", excerpt: "", image: "", author: "Admin", status: "published", isFeatured: false,
    contentBlocks: [] 
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const totalNews = safeNewsList.length;
  const publishedCount = safeNewsList.filter(item => item.status === "published").length;
  const draftCount = safeNewsList.filter(item => item.status === "draft").length;
  const featuredCount = safeNewsList.filter(item => item.isFeatured).length;

  const filteredNews = safeNewsList.filter(news => 
      (news.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "", excerpt: "", image: "", author: "Admin", status: "published", isFeatured: false,
      contentBlocks: [{ id: Date.now(), type: 'text', value: '' }] 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (news) => {
    setEditingId(news.id);
    
    let parsedBlocks = news.contentBlocks || [];
    if (!news.contentBlocks && news.content) {
        parsedBlocks = [{ id: Date.now(), type: 'text', value: news.content }];
    }

    setFormData({
      title: news.title || "",
      excerpt: news.excerpt || "",
      image: news.image || "",
      author: news.author || "Admin",
      status: news.status || "published",
      isFeatured: news.isFeatured || false,
      contentBlocks: parsedBlocks
    });
    setIsModalOpen(true);
  };

  // =========================================
  // BỘ NÃO CỦA HỆ THỐNG BLOCK BUILDER
  // =========================================
  const addBlock = (type) => {
      const newBlock = type === 'text' 
        ? { id: Date.now(), type: 'text', value: '' }
        : type === 'image' 
        ? { id: Date.now(), type: 'image', url: '', caption: '' }
        : { id: Date.now(), type: 'video', url: '', caption: '' };

      setFormData(prev => ({ ...prev, contentBlocks: [...prev.contentBlocks, newBlock] }));
  };

  const updateBlock = (id, field, value) => {
      setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.map(block => block.id === id ? { ...block, [field]: value } : block)
      }));
  };

  // 👉 THÊM VŨ KHÍ MỚI: Xử lý Bôi đen & Gắn thẻ HTML cho chữ
  const handleFormatText = (blockId, prefix, suffix) => {
      const textarea = document.getElementById(`news-text-block-${blockId}`);
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);

      const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      
      // Update vào field 'value' của block
      updateBlock(blockId, 'value', newText);

      // Giữ con trỏ mượt mà
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 0);
  };

  const removeBlock = (id) => {
      setFormData(prev => ({
          ...prev,
          contentBlocks: prev.contentBlocks.filter(block => block.id !== id)
      }));
  };

  const moveBlock = (index, direction) => {
      const blocks = [...formData.contentBlocks];
      if (direction === 'up' && index > 0) {
          [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      } else if (direction === 'down' && index < blocks.length - 1) {
          [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
      }
      setFormData(prev => ({ ...prev, contentBlocks: blocks }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleBlockImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateBlock(id, 'url', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return showToast("⚠️ Vui lòng nhập tiêu đề bài viết!", "error");
    if (!formData.image) return showToast("⚠️ Vui lòng chọn Ảnh bìa!", "error");
    if (formData.contentBlocks.length === 0) return showToast("⚠️ Bài viết phải có ít nhất 1 nội dung!", "error");

    try {
      if (editingId) {
        await updateNews({ ...formData, id: editingId });
        showToast("✅ Cập nhật tin tức thành công!", "success");
      } else {
        await addNews(formData);
        showToast("✅ Thêm tin tức thành công!", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast("❌ Không thể lưu tin tức!", "error");
    }
  };

  const handleDelete = (id, title) => {
    Swal.fire({
        title: 'Xóa bài viết?',
        text: `Boss có chắc muốn xóa tin tức "${title}" không?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#fa5252',
        cancelButtonColor: '#888',
        confirmButtonText: 'Xóa luôn!',
        cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteNews(id);
                showToast("🗑️ Đã xóa tin tức thành công!", "success");
            } catch (error) {
                showToast("❌ Không thể xóa tin tức!", "error");
            }
        }
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading) return <div className="news-loading"><i className="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>;

  return (
    <div className="admin-dashboard-container">
      {toast.show && (
        <div className={`news-toast ${toast.type}`}>
          <i className={toast.type === "error" ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check"}></i>
          {toast.message}
        </div>
      )}

      <div className="dashboard-header">
          <h2 className="dashboard-title">News List</h2>
          <p className="dashboard-subtitle">Quản lý bài viết, thông báo và tin tức cửa hàng.</p>
      </div>

      <div className="product-manage-layout">
        <div className="product-main-area dashboard-recent-orders">
            <div className="section-header" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                    <input type="text" placeholder="Tìm kiếm tiêu đề tin tức..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
                </div>
                <button className="btn-add-product" onClick={handleOpenAdd}>
                    <i className="fa-solid fa-plus"></i> Thêm Tin Tức
                </button>
            </div>

            {filteredNews.length === 0 ? (
                <div className="news-empty"><i className="fa-regular fa-newspaper"></i><h3>Chưa có tin tức</h3></div>
            ) : (
                <div className="news-list-grid">
                    {filteredNews.map(item => (
                        <div className="news-manage-card" key={item.id}>
                            <div className="news-card-image">
                                <img src={item.image || 'https://via.placeholder.com/400'} alt={item.title} />
                                {item.isFeatured && <span className="news-featured-badge">★ Nổi bật</span>}
                                <span className={`news-status-badge ${item.status === "published" ? "published" : "draft"}`}>
                                    {item.status === "published" ? "Đã đăng" : "Bản nháp"}
                                </span>
                            </div>
                            <div className="news-card-content">
                                <h4>{item.title}</h4>
                                <p className="news-excerpt">{item.excerpt || "Không có mô tả..."}</p>
                                
                                <div className="news-card-meta">
                                    <span><i className="fa-regular fa-user"></i> {item.author || "Admin"}</span>
                                    <span><i className="fa-regular fa-calendar"></i> {formatDate(item.createdAt)}</span>
                                </div>

                                <div className="news-card-actions">
                                    <button className="action-btn edit" onClick={() => handleOpenEdit(item)} title="Chỉnh sửa"><i className="fa-solid fa-pen-to-square"></i></button>
                                    <button className="action-btn delete" onClick={() => handleDelete(item.id, item.title)} title="Xóa"><i className="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <aside className="product-stats-sidebar">
            <div className="stat-card-right" style={{ borderTopColor: '#0ca678' }}><p>TỔNG TIN TỨC</p><h3>{totalNews} <small>Bài</small></h3></div>
            <div className="stat-card-right" style={{ borderTopColor: '#1c7ed6' }}><p>ĐÃ ĐĂNG</p><h3 style={{ color: '#1c7ed6' }}>{publishedCount} <small>Bài</small></h3></div>
            <div className="stat-card-right warning"><p>BẢN NHÁP</p><h3 className="text-warning">{draftCount} <small>Bài</small></h3></div>
            <div className="stat-card-right danger"><p>TIN NỔI BẬT</p><h3 className="text-danger">{featuredCount} <small>Bài</small></h3></div>
        </aside>
      </div>

      {/* ========================== MODAL FORM BUILDER ========================== */}
      {isModalOpen && (
        <div className="news-modal-overlay">
          <div className="news-modal" style={{ maxWidth: '800px' }}>
            <div className="news-modal-header">
              <h2>{editingId ? "Chỉnh Sửa Bài Viết" : "Soạn Bài Viết Mới"}</h2>
              <button type="button" className="news-modal-close" onClick={() => setIsModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="news-form-row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="news-form-group">
                        <label>Tiêu đề bài viết *</label>
                        <input type="text" placeholder="Nhập tiêu đề bài viết..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      </div>

                      <div className="news-form-row">
                          <div className="news-form-group"><label>Tác giả</label><input type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} /></div>
                          <div className="news-form-group">
                            <label>Trạng thái</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="published">Đã đăng</option><option value="draft">Bản nháp</option>
                            </select>
                          </div>
                      </div>

                      <div className="news-form-group">
                        <label>Đoạn mở bài (Lead / Excerpt)</label>
                        <textarea rows="3" placeholder="Đoạn mở bài in đậm..." value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                      </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="news-form-group">
                        <label>Ảnh bìa ngoài (Cover) *</label>
                        <div className="news-image-upload" onClick={() => fileCoverRef.current.click()}>
                            {formData.image ? <img src={formData.image} alt="Cover" /> : <div><i className="fa-solid fa-image"></i><p>Tải ảnh bìa</p></div>}
                        </div>
                        <input type="file" accept="image/*" ref={fileCoverRef} onChange={handleCoverUpload} style={{ display: "none" }} />
                      </div>
                      <div className="news-featured-check">
                        <label>
                            <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                            <span>⭐ Hiện ở Trang chủ</span>
                        </label>
                      </div>
                  </div>
              </div>

              {/* ================= GIAO DIỆN CHÈN BLOCK NỘI DUNG ================= */}
              <div className="news-form-group" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '15px', color: '#6f4323', borderBottom: '2px solid #6f4323', paddingBottom: '5px', display: 'inline-block' }}>
                    <i className="fa-solid fa-pen-nib"></i> Nội dung bài viết (Thêm khối bên dưới)
                </label>

                <div className="dynamic-blocks-container">
                    {formData.contentBlocks && formData.contentBlocks.map((block, index) => (
                        <div key={block.id} className="block-item">
                            
                            <div className="block-controls">
                                <span style={{ marginRight: 'auto', fontSize: '12px', color: '#888', fontWeight: 'bold', paddingTop: '5px' }}>
                                    {block.type === 'text' ? 'ĐOẠN VĂN BẢN' : block.type === 'image' ? 'HÌNH ẢNH MINH HỌA' : 'VIDEO YOUTUBE'}
                                </span>
                                <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0}><i className="fa-solid fa-arrow-up"></i></button>
                                <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === formData.contentBlocks.length - 1}><i className="fa-solid fa-arrow-down"></i></button>
                                <button type="button" className="btn-del-block" onClick={() => removeBlock(block.id)}><i className="fa-solid fa-trash-can"></i></button>
                            </div>

                            {/* 👉 ĐÃ NÂNG CẤP TEXT BLOCK CÓ TOOLBAR */}
                            {block.type === 'text' && (
                                <div className="news-text-block-wrapper">
                                    <div className="news-block-format-toolbar">
                                        <button type="button" onClick={() => handleFormatText(block.id, '<b>', '</b>')} title="In đậm (Bôi đen chữ rồi bấm)"><i className="fa-solid fa-bold"></i></button>
                                        <button type="button" onClick={() => handleFormatText(block.id, '<i>', '</i>')} title="In nghiêng"><i className="fa-solid fa-italic"></i></button>
                                        <button type="button" onClick={() => handleFormatText(block.id, '<u>', '</u>')} title="Gạch chân"><i className="fa-solid fa-underline"></i></button>
                                        <div className="news-toolbar-divider"></div>
                                        <button type="button" onClick={() => handleFormatText(block.id, '<br/>• ', '')} title="Chấm đầu dòng"><i className="fa-solid fa-list-ul"></i></button>
                                        <button type="button" onClick={() => handleFormatText(block.id, '<br/>- ', '')} title="Gạch đầu dòng"><i className="fa-solid fa-minus"></i></button>
                                        <div className="news-toolbar-divider"></div>
                                        <button type="button" onClick={() => handleFormatText(block.id, '<span style="color:#b23a2c">', '</span>')} title="Chữ màu đỏ Cà phê"><i className="fa-solid fa-droplet" style={{color: '#b23a2c'}}></i></button>
                                    </div>
                                    <textarea 
                                        id={`news-text-block-${block.id}`}
                                        className="news-block-input-text"
                                        placeholder="Nhập nội dung đoạn văn... (Bôi đen chữ và chọn công cụ ở trên để trang trí)" 
                                        value={block.value} 
                                        onChange={(e) => updateBlock(block.id, 'value', e.target.value)} 
                                    />
                                </div>
                            )}

                            {block.type === 'image' && (
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="news-image-upload" style={{ flex: 1, height: '140px' }}>
                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}>
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleBlockImageUpload(block.id, e)} />
                                            {block.url ? <img src={block.url} alt="Block" /> : <div><i className="fa-solid fa-upload"></i> Chọn ảnh</div>}
                                        </label>
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <input type="text" className="caption-input" placeholder="Viết chú thích cho ảnh (In nghiêng bên dưới ảnh)..." value={block.caption} onChange={(e) => updateBlock(block.id, 'caption', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {block.type === 'video' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input type="text" placeholder="Dán link Video Youtube vào đây (Ví dụ: https://www.youtube.com/watch?v=...)" value={block.url} onChange={(e) => updateBlock(block.id, 'url', e.target.value)} />
                                    <input type="text" className="caption-input" placeholder="Viết chú thích cho video..." value={block.caption} onChange={(e) => updateBlock(block.id, 'caption', e.target.value)} />
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="add-block-group">
                        <button type="button" onClick={() => addBlock('text')}><i className="fa-solid fa-paragraph"></i> + Thêm Đoạn văn</button>
                        <button type="button" onClick={() => addBlock('image')}><i className="fa-regular fa-image"></i> + Thêm Hình ảnh</button>
                        <button type="button" onClick={() => addBlock('video')}><i className="fa-brands fa-youtube"></i> + Thêm Video</button>
                    </div>
                </div>
              </div>

              <div className="news-modal-actions">
                <button type="button" className="news-cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="news-save-btn">{editingId ? "Cập Nhật Bài Viết" : "Đăng Bài Viết"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManage;