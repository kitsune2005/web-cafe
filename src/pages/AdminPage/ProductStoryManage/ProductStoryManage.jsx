import React, { useState } from 'react';
import { useProduct } from '../../../context/ProductContext';
import toast from 'react-hot-toast';
import '../Dashboard/Dashboard.css'; 
import './ProductStoryManage.css';  

const ProductStoryManage = () => {
    const { products, formatPrice, updateProductStory } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');
    
    // 👉 ĐÃ THÊM: State quản lý trạng thái bộ lọc kho
    const [stockFilter, setStockFilter] = useState('all'); 

    // State cho Modal Viết tiểu sử
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [storyData, setStoryData] = useState({
        shortDesc: '',
        longDesc: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    // 👉 ĐÃ NÂNG CẤP: Lọc theo Tên kết hợp với Tình trạng kho
    const filteredProducts = products.filter(p => {
        // 1. Kiểm tra từ khóa tìm kiếm
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Kiểm tra bộ lọc tình trạng kho
        let matchStock = true;
        if (stockFilter === 'low') {
            matchStock = p.stock > 0 && p.stock < 10;
        } else if (stockFilter === 'out') {
            matchStock = !p.stock || p.stock === 0;
        }

        // 3. Phải thỏa mãn cả 2 mới hiển thị
        return matchSearch && matchStock;
    });

    const openEditModal = (product) => {
        setEditingProduct(product);
        setStoryData({
            shortDesc: product.shortDesc || '',
            longDesc: product.longDesc || ''
        });
        setIsModalOpen(true);
    };

    const handleSaveStory = async (e) => {
        e.preventDefault();
        if (updateProductStory) {
            setIsSaving(true);
            const success = await updateProductStory(editingProduct.id, storyData.shortDesc, storyData.longDesc);
            setIsSaving(false);

            if (success) {
                toast.success(`Đã cập nhật tiểu sử cho: ${editingProduct.name}`);
                setIsModalOpen(false); 
            } else {
                toast.error("Lỗi kết nối Server! Không thể lưu dữ liệu.");
            }
        } else {
             toast.error("Thiếu hàm updateProductStory trong ProductContext!");
        }
    };

    return (
        <div className="admin-dashboard-container">
            {/* HEADER CHUẨN DASHBOARD */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">Quản lý Tiểu sử Sản phẩm</h2>
                <p className="dashboard-subtitle">Thêm câu chuyện, nguồn gốc và hương vị chi tiết cho từng loại cà phê.</p>
            </div>

            <div className="dashboard-recent-orders">
                
                {/* 👉 KHU VỰC TÌM KIẾM & LỌC KHO */}
                <div className="section-header" style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên sản phẩm..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
                    </div>

                    {/* Bộ Lọc Dropdown */}
                    <select 
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', background: '#fff', color: '#555', cursor: 'pointer', minWidth: '160px' }}
                    >
                        <option value="all">Tất cả tình trạng</option>
                        <option value="low">Sắp hết hàng (&lt;10)</option>
                        <option value="out">Đã hết hàng (0)</option>
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>SẢN PHẨM</th>
                                <th>DANH MỤC</th>
                                <th>TRẠNG THÁI TIỂU SỬ</th>
                                <th className="text-center" style={{textAlign: 'center'}}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img src={product.imageFront || product.img} alt={product.name} style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #eee' }} />
                                            <div>
                                                <strong style={{ display: 'block', marginBottom: '4px', color: '#333' }}>{product.name}</strong>
                                                <span style={{ fontSize: '13px', color: '#b23a2c', fontWeight: '600' }}>{formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        {product.longDesc || product.shortDesc ? (
                                            <span className="status-badge success"><i className="fa-solid fa-check"></i> Đã viết</span>
                                        ) : (
                                            <span className="status-badge warning"><i className="fa-solid fa-pen"></i> Chưa có</span>
                                        )}
                                    </td>
                                    <td style={{textAlign: 'center'}}>
                                        <button className="btn-edit-story" onClick={() => openEditModal(product)}>
                                            <i className="fa-solid fa-book-open"></i> Viết tiểu sử
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                        Không tìm thấy sản phẩm nào phù hợp!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL VIẾT TIỂU SỬ */}
            {isModalOpen && (
                <div className="story-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="story-modal">
                        <div className="modal-header">
                            <h3>Tiểu sử: {editingProduct?.name}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveStory}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Mô tả ngắn (Hiển thị ngay dưới tên SP)</label>
                                    <textarea 
                                        rows="3" 
                                        value={storyData.shortDesc}
                                        onChange={(e) => setStoryData({...storyData, shortDesc: e.target.value})}
                                        placeholder="Ví dụ: Sự kết hợp hoàn hảo giữa đắng và ngọt..."
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Câu chuyện chi tiết (Tab Mô Tả)</label>
                                    <textarea 
                                        rows="10" 
                                        value={storyData.longDesc}
                                        onChange={(e) => setStoryData({...storyData, longDesc: e.target.value})}
                                        placeholder="Kể câu chuyện về sản phẩm ở đây... Có thể dùng thẻ HTML như <p>, <b>, <br/>..."
                                    ></textarea>
                                    <small className="html-hint"><i className="fa-brands fa-html5"></i> Hỗ trợ nhập định dạng HTML để đoạn văn đẹp hơn.</small>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={isSaving}>
                                    {isSaving ? (
                                        <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</>
                                    ) : (
                                        <><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductStoryManage;