import React, { useState, useRef } from 'react';
import { useProduct } from '../../../context/ProductContext';
import './ProductManage.css';

const ProductManage = () => {
  const { products, addProduct, deleteProduct, updateProduct, formatPrice } = useProduct();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const fileInputFrontRef = useRef(null);
  const fileInputBackRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Thêm field 'isFeatured' (Mặc định là true để tạo xong hiện ngoài Trang chủ luôn)
  const [formData, setFormData] = useState({ 
    name: '', category: 'Cà phê nguyên chất', oldPrice: '', discount: '', stock: '', imageFront: '', imageBack: '', isFeatured: true 
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'Cà phê nguyên chất', oldPrice: '', discount: '', stock: '', imageFront: '', imageBack: '', isFeatured: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      oldPrice: product.oldPrice || product.price,
      discount: product.discount || '',
      stock: product.stock,
      imageFront: product.imageFront || product.img || '',
      imageBack: product.imageBack || product.img || '',
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : true
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [side]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatedPrice = formData.oldPrice 
    ? formData.oldPrice - (formData.oldPrice * (Number(formData.discount) || 0) / 100)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) return showToast("⚠️ Kitsune quên nhập Tên sản phẩm kìa!", "error");
    if (formData.oldPrice === '') return showToast("⚠️ Chưa nhập Giá gốc kìa!", "error");
    if (formData.stock === '') return showToast("⚠️ Ô 'Số lượng kho' đang bỏ trống!", "error");
    if (!formData.imageFront) return showToast("⚠️ Kitsune chưa tải Ảnh mặt trước!", "error");
    if (!formData.imageBack) return showToast("⚠️ Kitsune chưa tải Ảnh mặt sau!", "error");

    const productData = {
      name: formData.name,
      category: formData.category,
      oldPrice: Number(formData.oldPrice),
      price: calculatedPrice,
      discount: Number(formData.discount) || 0,
      stock: Number(formData.stock),
      imageFront: formData.imageFront,
      imageBack: formData.imageBack, 
      isFeatured: formData.isFeatured, // NÚT QUYỀN LỰC MỚI
      rating: 5,
      status: Number(formData.stock) > 0 ? 'Còn hàng' : 'Hết hàng'
    };

    try {
      if (editingId) {
        await updateProduct({ ...productData, id: editingId });
        showToast("✅ Đã cập nhật sản phẩm thành công!", "success");
      } else {
        await addProduct(productData);
        showToast("✅ Đã thêm món mới vào menu!", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu vào Database:", error);
      showToast("❌ Lỗi Database: Hệ thống từ chối lưu dữ liệu!", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Kitsune có chắc chắn muốn XÓA món "${name}" không?`)) {
      try {
        await deleteProduct(id);
        showToast("🗑️ Đã xóa sản phẩm thành công!", "success");
      } catch (error) {
        console.error("Lỗi khi xóa trong Database:", error);
        showToast("❌ Lỗi Database: Không thể xóa sản phẩm lúc này!", "error");
      }
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', 
    border: '1px solid #ddd', outline: 'none', fontFamily: 'inherit'
  };

  return (
    <div className="product-manage-page" style={{ display: 'flex', gap: '24px', padding: '24px', position: 'relative' }}>
      
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 999999,
          background: toast.type === 'error' ? '#fa5252' : '#0ca678',
          color: '#fff', padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px',
          fontWeight: 'bold', fontSize: '15px', animation: 'slideUp 0.3s ease-out forwards'
        }}>
          <i className={toast.type === 'error' ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check"} style={{ fontSize: '20px' }}></i>
          {toast.message}
        </div>
      )}

      <style>
        {`@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}
      </style>

      {/* CỘT TRÁI */}
      <div className="product-list-section" style={{ flex: 3 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', color: '#333' }}>Menu List</h3>
            <div className="breadcrumb" style={{ fontSize: '14px', color: '#888' }}>Home &gt; Menu &gt; Menu list</div>
          </div>
          <button onClick={handleOpenAdd} style={{ background: '#6f4323', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Thêm Sản Phẩm
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {products.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
              
              {item.discount > 0 && (
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff6b6b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  -{item.discount}%
                </span>
              )}

              {item.isFeatured && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#20c997', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  ★ Trang chủ
                </span>
              )}

              <img src={item.imageFront || item.img} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', border: '2px solid #f1f1f1' }} />
              <h4 style={{ fontSize: '15px', color: '#333', marginBottom: '8px', minHeight: '44px' }}>{item.name}</h4>
              
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                <p style={{ marginBottom: '4px' }}>{item.category}</p>
                {item.oldPrice && item.discount > 0 ? (
                   <p>
                     <del style={{ color: '#aaa', marginRight: '6px' }}>{formatPrice(item.oldPrice)}</del>
                     <strong style={{ color: '#b23a2c' }}>{formatPrice(item.price)}</strong>
                   </p>
                ) : (
                   <p><strong style={{ color: '#b23a2c' }}>{formatPrice(item.price)}</strong></p>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <span style={{ background: '#e6fcf5', color: '#0ca678', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  <i className="fa-solid fa-box"></i> {item.stock}
                </span>
                <button onClick={() => handleOpenEdit(item)} style={{ background: '#eef2ff', color: '#3b82f6', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer' }}>
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} style={{ background: '#ffe3e3', color: '#fa5252', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer' }}>
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="product-stats-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Tổng sản phẩm</p>
          <h2 style={{ fontSize: '32px', color: '#333' }}>{products.length} Món</h2>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '520px', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            <h2 style={{ marginBottom: '20px', color: '#382212' }}>{editingId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Món Mới'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <input type="text" placeholder="Tên sản phẩm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle}/>
              
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle}>
                <option>Cà phê nguyên chất</option>
                <option>Cà phê đóng gói</option>
                <option>Cà phê phin</option>
              </select>

              {/* Ô TICK BÁO HIỆN TRANG CHỦ */}
              <div style={{ background: '#fdfbf7', padding: '12px', borderRadius: '8px', border: '1px solid #e0d5c1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#6f4323' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured} 
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6f4323' }}
                  />
                  📌 Hiển thị sản phẩm này ngoài Trang chủ
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Giá gốc (VND)</label>
                  <input type="number" placeholder="Ví dụ: 250000" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} style={inputStyle}/>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>% Giảm giá</label>
                  <input type="number" placeholder="Ví dụ: 15" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} style={inputStyle}/>
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#555' }}>Giá bán thực tế:</span>
                <strong style={{ color: '#b23a2c', fontSize: '18px' }}>{formatPrice(calculatedPrice)}</strong>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block' }}>Số lượng kho</label>
                <input type="number" placeholder="Số lượng" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={inputStyle}/>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                
                <div style={{ flex: 1, border: '2px dashed #ccc', borderRadius: '8px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '10px' }}>Ảnh mặt trước</label>
                  {formData.imageFront ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img src={formData.imageFront} alt="Front Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <button type="button" onClick={() => fileInputFrontRef.current.click()} style={{ fontSize: '11px', background: '#eee', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Đổi ảnh</button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputFrontRef.current.click()} style={{ cursor: 'pointer', color: '#888', padding: '10px 0' }}>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                      <span style={{ fontSize: '12px' }}>Tải ảnh lên</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputFrontRef} onChange={e => handleImageUpload(e, 'imageFront')} style={{ display: 'none' }} />
                </div>

                <div style={{ flex: 1, border: '2px dashed #ccc', borderRadius: '8px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '10px' }}>Ảnh mặt sau (Hover)</label>
                  {formData.imageBack ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img src={formData.imageBack} alt="Back Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <button type="button" onClick={() => fileInputBackRef.current.click()} style={{ fontSize: '11px', background: '#eee', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Đổi ảnh</button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputBackRef.current.click()} style={{ cursor: 'pointer', color: '#888', padding: '10px 0' }}>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                      <span style={{ fontSize: '12px' }}>Tải ảnh lên</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputBackRef} onChange={e => handleImageUpload(e, 'imageBack')} style={{ display: 'none' }} />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#f1f1f1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#6f4323', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManage;