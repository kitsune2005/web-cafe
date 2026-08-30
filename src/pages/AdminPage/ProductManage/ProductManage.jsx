import React, { useState } from 'react';
import { useProduct } from '../../../context/ProductContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../Dashboard/Dashboard.css'; 
import './ProductManage.css'; 

const ProductManage = () => {
    const { products, deleteProduct, formatPrice } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');
    
    // STATE CHO PHÂN TRANG (PAGINATION)
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 16; 

    // 👉 TÍNH TOÁN DỮ LIỆU KHO CHO CỘT BÊN PHẢI
    const totalProducts = products.length;
    // Hết hàng: Tồn kho = 0 hoặc undefined
    const outOfStockCount = products.filter(p => !p.stock || p.stock === 0).length;
    // Sắp hết hàng: Tồn kho từ 1 đến dưới 10
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Xóa sản phẩm?',
            text: `Boss có chắc muốn xóa "${name}" khỏi Menu không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fa5252',
            cancelButtonColor: '#888',
            confirmButtonText: 'Xóa luôn!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(id);
                toast.success("Đã xóa thành công!");
            }
        });
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // LOGIC TÍNH TOÁN PHÂN TRANG
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Menu List</h2>
                <p className="dashboard-subtitle">Quản lý danh sách sản phẩm, giá bán và tồn kho.</p>
            </div>

            {/* 👉 BỐ CỤC 2 CỘT CHÍNH */}
            <div className="product-manage-layout">
                
                {/* CỘT TRÁI: TÌM KIẾM, LƯỚI SẢN PHẨM & PHÂN TRANG */}
                <div className="product-main-area dashboard-recent-orders">
                    <div className="section-header" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', flex: 1, maxWidth: '400px' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm tên sản phẩm..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); 
                                }}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                            />
                        </div>
                        
                        <button className="btn-add-product" onClick={() => toast("Tính năng thêm đang mở form!")}>
                            <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm
                        </button>
                    </div>

                    {/* LƯỚI HIỂN THỊ SẢN PHẨM */}
                    <div className="admin-product-grid">
                        {currentProducts.length === 0 ? (
                            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888'}}>Không tìm thấy món nào!</div>
                        ) : (
                            currentProducts.map(product => (
                                <div className="admin-product-card" key={product.id}>
                                    {product.discount > 0 && <span className="badge-discount">-{product.discount}%</span>}
                                    {product.isFeatured && <span className="badge-home"><i className="fa-solid fa-star"></i> Trang chủ</span>}

                                    <img src={product.imageFront || product.img} alt={product.name} />

                                    <h4 className="product-name">{product.name}</h4>
                                    <p className="product-category">{product.category}</p>

                                    <div className="product-prices">
                                        {product.oldPrice > 0 && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
                                        <span className="new-price">{formatPrice(product.price)}</span>
                                    </div>

                                    <div className="card-actions">
                                        {/* Hiển thị màu kho bãi: Đỏ nếu hết, Vàng nếu sắp hết */}
                                        <div className={`stock-badge ${(!product.stock || product.stock === 0) ? 'danger' : (product.stock < 10 ? 'warning' : 'success')}`}>
                                            <i className="fa-solid fa-box"></i> {product.stock || 0}
                                        </div>
                                        <button className="action-btn edit" title="Sửa"><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="action-btn delete" title="Xóa" onClick={() => handleDelete(product.id, product.name)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* BỘ PHÂN TRANG (PAGINATION) */}
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button className="page-btn" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}

                            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>

                {/* 👉 CỘT PHẢI: THỐNG KÊ KHO (Dính chặt khi cuộn trang) */}
                <aside className="product-stats-sidebar">
                    <div className="stat-card-right">
                        <p>TỔNG SẢN PHẨM</p>
                        <h3>{totalProducts} <small>Món</small></h3>
                    </div>
                    <div className="stat-card-right warning">
                        <p>SẮP HẾT HÀNG (&lt;10)</p>
                        <h3 className="text-warning">{lowStockCount} <small>Món</small></h3>
                    </div>
                    <div className="stat-card-right danger">
                        <p>HẾT HÀNG (0)</p>
                        <h3 className="text-danger">{outOfStockCount} <small>Món</small></h3>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default ProductManage;