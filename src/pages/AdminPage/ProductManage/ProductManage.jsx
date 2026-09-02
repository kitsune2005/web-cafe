import React, { useState, useEffect } from 'react';
import { useProduct } from '../../../context/ProductContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../Dashboard/Dashboard.css'; 
import './ProductManage.css'; 

const ProductManage = () => {
    const { products, deleteProduct, formatPrice, addProduct, updateProduct } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');
    
    const [stockFilter, setStockFilter] = useState('all'); 
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 16; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); 
    
    const [formData, setFormData] = useState({
        name: '', category: 'Cà phê nguyên chất', price: '', oldPrice: '', stock: '', imageFront: '', imageBack: '', discount: 0, isFeatured: false
    });

    const safeProducts = Array.isArray(products) ? products : [];
    
    const totalProducts = safeProducts.length;
    const outOfStockCount = safeProducts.filter(p => !p.stock || Number(p.stock) === 0).length;
    const lowStockCount = safeProducts.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10).length;

    useEffect(() => {
        if (isModalOpen) {
            const oldP = Number(formData.oldPrice) || 0;
            const disc = Number(formData.discount) || 0;
            let calculatedPrice = oldP;
            
            if (oldP > 0 && disc > 0) {
                calculatedPrice = oldP - (oldP * disc / 100);
            }
            
            if (formData.price !== calculatedPrice) {
                setFormData(prev => ({ ...prev, price: calculatedPrice }));
            }
        }
    }, [formData.oldPrice, formData.discount, isModalOpen]);

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: 'Cà phê nguyên chất', price: '', oldPrice: '', stock: '', imageFront: '', imageBack: '', discount: 0, isFeatured: false });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setFormData({ 
            name: product.name || '', 
            category: product.category || 'Cà phê nguyên chất', 
            price: product.price || 0, 
            oldPrice: product.oldPrice || product.price || '', 
            stock: product.stock || 0, 
            imageFront: product.imageFront || product.img || '', 
            imageBack: product.imageBack || '', 
            discount: product.discount || 0,
            isFeatured: product.isFeatured || false 
        });
        setIsModalOpen(true);
    };

    const handleImageUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.imageFront) {
            toast.error("Boss quên tải ảnh mặt trước kìa!");
            return;
        }

        const payload = {
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            oldPrice: formData.oldPrice ? Number(formData.oldPrice) : 0,
            stock: Number(formData.stock),
            discount: formData.discount ? Number(formData.discount) : 0,
            img: formData.imageFront, 
            imageFront: formData.imageFront,
            imageBack: formData.imageBack,
            isFeatured: formData.isFeatured
        };

        try {
            if (editingProduct) {
                const finalUpdatedProduct = { id: editingProduct.id, ...payload };
                if (updateProduct) await updateProduct(finalUpdatedProduct);
                toast.success("Cập nhật sản phẩm thành công!", { id: 'update-prod-success' });
                
                if (stockFilter === 'out' && payload.stock > 0) {
                    setTimeout(() => {
                        toast("Sản phẩm đã được nạp kho nên dời về tab 'Tất cả' nhé Boss!", { icon: '📦' });
                    }, 500);
                }
            } else {
                if (addProduct) await addProduct({ ...payload, id: String(Date.now()) }); 
                toast.success("Thêm sản phẩm mới thành công! ", { id: 'add-prod-success' });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu dữ liệu lên Server!");
            console.error(error);
        }
    };

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
                toast.success("Đã xóa thành công!", { id: 'delete-prod-success' });
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const filteredProducts = safeProducts.filter(p => {
        const pName = p.name || ''; 
        const searchStr = searchTerm || '';
        const matchSearch = pName.toLowerCase().includes(searchStr.toLowerCase());
        
        let matchStock = true;
        if (stockFilter === 'low') {
            matchStock = Number(p.stock) > 0 && Number(p.stock) < 10;
        } else if (stockFilter === 'out') {
            matchStock = !p.stock || Number(p.stock) === 0;
        }
        return matchSearch && matchStock;
    });

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

            <div className="product-manage-layout">
                
                {/* CỘT TRÁI */}
                <div className="product-main-area pm-panel">
                    
                    <div className="pm-toolbar">
                        <div className="pm-search-group">
                            <div className="pm-search-box">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm tên sản phẩm..." 
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); 
                                    }}
                                />
                            </div>

                            <select 
                                value={stockFilter}
                                onChange={(e) => {
                                    setStockFilter(e.target.value);
                                    setCurrentPage(1); 
                                }}
                                className="pm-filter-select"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="low">Gần hết hàng (&lt;10)</option>
                                <option value="out">Đã hết hàng (0)</option>
                            </select>
                        </div>
                        
                        <button className="btn-add-product" onClick={handleOpenAdd}>
                            <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm
                        </button>
                    </div>

                    <div className="admin-product-grid">
                        {currentProducts.length === 0 ? (
                            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem', color: '#888'}}>Không tìm thấy món nào!</div>
                        ) : (
                            currentProducts.map(product => (
                                <div className="admin-product-card" key={product.id}>
                                    {product.discount > 0 && <span className="badge-discount">-{product.discount}%</span>}
                                    {product.isFeatured && <span className="badge-home"><i className="fa-solid fa-star"></i> Trang chủ</span>}

                                    <img src={product.imageFront || product.img} alt={product.name || 'Sản phẩm'} />

                                    <h4 className="product-name">{product.name || 'Chưa có tên'}</h4>
                                    <p className="product-category">{product.category}</p>

                                    <div className="product-prices">
                                        {product.oldPrice > 0 && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
                                        <span className="new-price">{formatPrice(product.price)}</span>
                                    </div>

                                    <div className="card-actions">
                                        <div className={`stock-badge ${(!product.stock || Number(product.stock) === 0) ? 'danger' : (Number(product.stock) < 10 ? 'warning' : 'success')}`}>
                                            <i className="fa-solid fa-box"></i> {product.stock || 0}
                                        </div>
                                        
                                        <button className="action-btn edit" title="Sửa" onClick={() => handleOpenEdit(product)}>
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        
                                        <button className="action-btn delete" title="Xóa" onClick={() => handleDelete(product.id, product.name)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

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

                {/* CỘT PHẢI */}
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

            {/* BẢNG MODAL (Đã Cách Ly 100% bằng class pm- ) */}
            {isModalOpen && (
                <div className="product-modal-overlay">
                    <div className="product-modal-box">
                        <div className="pm-modal-header">
                            <h3>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Món Mới'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="pm-modal-form">
                            <div className="pm-form-group">
                                <label>Tên sản phẩm *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            
                            <div className="pm-form-group">
                                <label>Danh mục *</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    <option value="Cà phê nguyên chất">Cà phê nguyên chất</option>
                                    <option value="Cà phê đóng gói">Cà phê đóng gói</option>
                                    <option value="Cà phê phin">Cà phê phin</option>
                                </select>
                            </div>

                            <div className="pm-form-group pm-featured-group">
                                <label className="pm-featured-label">
                                    <input 
                                        type="checkbox" 
                                        name="isFeatured" 
                                        checked={formData.isFeatured} 
                                        onChange={handleInputChange} 
                                    />
                                    <span><i className="fa-solid fa-thumbtack" style={{color: '#fa5252', transform: 'rotate(-45deg)'}}></i> Hiển thị sản phẩm này ngoài Trang chủ</span>
                                </label>
                            </div>

                            <div className="pm-form-row">
                                <div className="pm-form-group">
                                    <label>Giá gốc (VNĐ) *</label>
                                    <input type="number" name="oldPrice" placeholder="Ví dụ: 250000" value={formData.oldPrice} onChange={handleInputChange} required min="0" />
                                </div>
                                <div className="pm-form-group">
                                    <label>% Giảm giá</label>
                                    <input type="number" name="discount" placeholder="Ví dụ: 15" value={formData.discount} onChange={handleInputChange} min="0" max="100" />
                                </div>
                            </div>
                            
                            <div className="pm-form-group">
                                <label>Giá bán thực tế (Tính tự động)</label>
                                <div className="pm-price-display">
                                    {formatPrice ? formatPrice(formData.price || 0) : `${(formData.price || 0).toLocaleString('vi-VN')}₫`}
                                </div>
                            </div>

                            <div className="pm-form-group">
                                <label>Số lượng kho *</label>
                                <input type="number" name="stock" placeholder="Số lượng" value={formData.stock} onChange={handleInputChange} required min="0" />
                            </div>

                            <div className="pm-form-group">
                                <label>Hình ảnh sản phẩm *</label>
                                <div className="pm-upload-row">
                                    <div className="pm-upload-box">
                                        <label>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageFront')} hidden />
                                            {formData.imageFront ? (
                                                <img src={formData.imageFront} alt="Mặt trước" className="pm-preview-img" />
                                            ) : (
                                                <div className="pm-upload-placeholder">
                                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                                    <span>Tải ảnh lên<br/>(Ảnh mặt trước)</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <div className="pm-upload-box">
                                        <label>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBack')} hidden />
                                            {formData.imageBack ? (
                                                <img src={formData.imageBack} alt="Mặt sau" className="pm-preview-img" />
                                            ) : (
                                                <div className="pm-upload-placeholder">
                                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                                    <span>Tải ảnh lên<br/>(Ảnh mặt sau - Hover)</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pm-modal-actions">
                                <button type="button" className="pm-btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="pm-btn-save">{editingProduct ? 'Cập Nhật' : 'Tạo Sản Phẩm'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManage;