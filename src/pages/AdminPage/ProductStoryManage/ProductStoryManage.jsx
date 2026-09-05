import React, { useState } from 'react';
import { useProduct } from '../../../context/ProductContext';
import toast from 'react-hot-toast';
import '../Dashboard/Dashboard.css'; 
import './ProductStoryManage.css';  

const uploadImageSmart = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file); 

        const res = await fetch('http://localhost:5000/upload', { 
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            return data.url || `http://localhost:5000/uploads/products/${data.filename || file.name}`; 
        }
    } catch (error) {
        console.warn("Lỗi API Localhost hoặc chưa cấu hình, chuyển sang dùng Cloud ImgBB...");
    }

    try {
        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); 
            reader.readAsDataURL(file);
        });

        const urlParams = new URLSearchParams();
        urlParams.append('image', base64Data);
        const apiKey = '8d27ce09315bce6ba4772b5e2eb22039'; 
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: urlParams.toString()
        });
        const data = await res.json();
        if (data?.data?.url) return data.data.url;
    } catch (error) {
        console.error("Cloud ImgBB bị chặn. Lùi về Base64...");
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
};

const ProductStoryManage = () => {
    const { products, formatPrice, updateProductStory } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [storyData, setStoryData] = useState({
        shortDesc: '',
        gallery: [], 
        blocks: [] 
    });

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        let matchStock = true;
        if (stockFilter === 'low') matchStock = p.stock > 0 && p.stock < 10;
        else if (stockFilter === 'out') matchStock = !p.stock || p.stock === 0;
        return matchSearch && matchStock;
    });

    const openEditModal = (product) => {
        setEditingProduct(product);
        
        let parsedGallery = [];
        let parsedBlocks = [];
        
        //   ĐÃ SỬA: Đọc dữ liệu thông minh, nhận diện cả Object lẫn String cũ
        try {
            if (product.longDesc) {
                if (typeof product.longDesc === 'object') {
                    // Nếu là chuẩn mới (Object)
                    if (product.longDesc.gallery) parsedGallery = product.longDesc.gallery;
                    if (product.longDesc.blocks) parsedBlocks = product.longDesc.blocks;
                } else if (typeof product.longDesc === 'string') {
                    // Nếu là chuẩn cũ (String bị stringify)
                    if (product.longDesc.startsWith('{')) {
                        const parsed = JSON.parse(product.longDesc);
                        if (parsed.gallery) parsedGallery = parsed.gallery;
                        if (parsed.blocks) parsedBlocks = parsed.blocks;
                    } else {
                        // Nếu là HTML rác cũ
                        parsedBlocks = [{ id: Date.now().toString(), type: 'text', content: product.longDesc }];
                    }
                }
            }
        } catch (e) {
            if (typeof product.longDesc === 'string') {
                parsedBlocks = [{ id: Date.now().toString(), type: 'text', content: product.longDesc }];
            }
        }

        setStoryData({
            shortDesc: product.shortDesc || '',
            gallery: parsedGallery,
            blocks: parsedBlocks
        });
        setIsModalOpen(true);
    };

    const addBlock = (type) => {
        setStoryData(prev => ({
            ...prev,
            blocks: [...prev.blocks, { id: Date.now().toString(), type, content: '' }]
        }));
    };

    const updateBlockContent = (id, content) => {
        setStoryData(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, content } : b)
        }));
    };

    const handleFormatText = (blockId, prefix, suffix) => {
        const textarea = document.getElementById(`text-block-${blockId}`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
        updateBlockContent(blockId, newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }, 0);
    };

    const moveBlock = (index, direction) => {
        if (index + direction < 0 || index + direction >= storyData.blocks.length) return;
        setStoryData(prev => {
            const newBlocks = [...prev.blocks];
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[index + direction];
            newBlocks[index + direction] = temp;
            return { ...prev, blocks: newBlocks };
        });
    };

    const deleteBlock = (id) => {
        setStoryData(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
    };

    const handleBlockImageUpload = async (id, e) => {
        const file = e.target.files[0];
        if (file) {
            const toastId = toast.loading("Đang tải ảnh lên...");
            const imgData = await uploadImageSmart(file);
            if (imgData) {
                updateBlockContent(id, imgData);
                toast.success("Thêm ảnh thành công!", { id: toastId });
            } else {
                toast.error("Lỗi khi xử lý ảnh!", { id: toastId });
            }
        }
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const toastId = toast.loading("Đang tải ảnh lên...");
            const imgData = await uploadImageSmart(file);
            if (imgData) {
                setStoryData(prev => ({
                    ...prev,
                    gallery: [...prev.gallery, imgData]
                }));
                toast.success("Thêm ảnh thành công!", { id: toastId });
            } else {
                toast.error("Lỗi khi xử lý ảnh!", { id: toastId });
            }
        }
    };

    const removeGalleryImage = (index) => {
        setStoryData(prev => {
            const newGallery = [...prev.gallery];
            newGallery.splice(index, 1);
            return { ...prev, gallery: newGallery };
        });
    };

    const handleSaveStory = async (e) => {
        e.preventDefault();
        if (updateProductStory) {
            setIsSaving(true);
            
            //   ĐÃ SỬA: Không biến thành String nữa, truyền thẳng Object để Backend tự động format xuống dòng!
            const complexLongDesc = {
                gallery: storyData.gallery,
                blocks: storyData.blocks
            };

            const success = await updateProductStory(editingProduct.id, storyData.shortDesc, complexLongDesc);
            setIsSaving(false);

            if (success) {
                toast.success(`Đã cập nhật bài viết cho: ${editingProduct.name}`);
                setIsModalOpen(false); 
            } else {
                toast.error("Lỗi kết nối Server! Không thể lưu dữ liệu.");
            }
        }
    };

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Quản lý Tiểu sử Sản phẩm</h2>
                <p className="dashboard-subtitle">Thiết kế cấu trúc nội dung, hình ảnh và video giới thiệu sinh động.</p>
            </div>

            <div className="dashboard-recent-orders">
                <div className="section-header" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '0.5rem', flex: 1, minWidth: '12.5rem', maxWidth: '25rem' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                        <input 
                            type="text" placeholder="Tìm theo tên sản phẩm..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                    <select 
                        value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #ddd', outline: 'none', fontSize: '0.875rem', background: '#fff', color: '#555', cursor: 'pointer', minWidth: '10rem' }}
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={product.imageFront || product.img} alt={product.name} style={{ width: '2.8rem', height: '2.8rem', borderRadius: '0.375rem', objectFit: 'cover', border: '1px solid #eee' }} />
                                            <div>
                                                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#333' }}>{product.name}</strong>
                                                <span style={{ fontSize: '0.8125rem', color: '#b23a2c', fontWeight: '600' }}>{formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        {product.longDesc || product.shortDesc ? (
                                            <span className="status-badge success"><i className="fa-solid fa-check"></i> Đã thiết kế</span>
                                        ) : (
                                            <span className="status-badge warning"><i className="fa-solid fa-pen"></i> Chưa có</span>
                                        )}
                                    </td>
                                    <td style={{textAlign: 'center'}}>
                                        <button className="btn-edit-story" onClick={() => openEditModal(product)}>
                                            <i className="fa-solid fa-wand-magic-sparkles"></i> Build Nội dung
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL BLOCK EDITOR CAO CẤP */}
            {isModalOpen && (
                <div className="news-overlay">
                    <div className="news-editor-box">
                        <div className="news-header">
                            <h3>Soạn Bài: {editingProduct?.name}</h3> 
                            <button type="button" className="news-close-btn" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="news-body">
                            
                            <div className="news-form-group">
                                <label className="news-label">Đoạn mở bài (Lead / Excerpt)</label>
                                <textarea 
                                    className="news-textarea short-desc"
                                    value={storyData.shortDesc}
                                    onChange={(e) => setStoryData({...storyData, shortDesc: e.target.value})}
                                    placeholder="Đoạn mở bài in đậm hiển thị dưới tên sản phẩm..."
                                ></textarea>
                            </div>

                            <div className="news-form-group">
                                <label className="news-label">Thư viện ảnh giới thiệu (Gallery)</label>
                                <div className="news-gallery-container">
                                    {storyData.gallery.map((img, index) => (
                                        <div className="news-gallery-item" key={index}>
                                            <img src={img} alt={`Gallery ${index}`} />
                                            <button type="button" onClick={() => removeGalleryImage(index)} className="btn-remove-gallery">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label className="news-gallery-upload">
                                        <input type="file" accept="image/*" onChange={handleGalleryUpload} hidden />
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                        <span>Tải ảnh lên</span>
                                    </label>
                                </div>
                            </div>

                            <div className="news-form-group" style={{ marginTop: '0.5rem' }}>
                                <label className="news-label"><i className="fa-solid fa-layer-group"></i> Nội dung bài viết (Xây dựng theo khối)</label>
                                
                                <div className="news-block-list">
                                    {storyData.blocks.map((block, index) => (
                                        <div className="news-block-item" key={block.id}>
                                            <div className="news-block-header">
                                                <span className="block-type">
                                                    {block.type === 'text' && <><i className="fa-solid fa-paragraph"></i> ĐOẠN VĂN BẢN</>}
                                                    {block.type === 'image' && <><i className="fa-regular fa-image"></i> HÌNH ẢNH</>}
                                                    {block.type === 'video' && <><i className="fa-brands fa-youtube"></i> VIDEO YOUTUBE</>}
                                                </span>
                                                <div className="news-block-actions">
                                                    <button type="button" title="Lên" onClick={() => moveBlock(index, -1)} disabled={index === 0}><i className="fa-solid fa-arrow-up"></i></button>
                                                    <button type="button" title="Xuống" onClick={() => moveBlock(index, 1)} disabled={index === storyData.blocks.length - 1}><i className="fa-solid fa-arrow-down"></i></button>
                                                    <button type="button" title="Xóa" onClick={() => deleteBlock(block.id)} className="danger"><i className="fa-solid fa-trash-can"></i></button>
                                                </div>
                                            </div>

                                            <div className="news-block-body">
                                                {block.type === 'text' && (
                                                    <div className="text-block-wrapper">
                                                        <div className="block-format-toolbar">
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<b>', '</b>')} title="In đậm (Bôi đen chữ rồi bấm)"><i className="fa-solid fa-bold"></i></button>
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<i>', '</i>')} title="In nghiêng"><i className="fa-solid fa-italic"></i></button>
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<u>', '</u>')} title="Gạch chân"><i className="fa-solid fa-underline"></i></button>
                                                            <div className="toolbar-divider"></div>
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<br/>• ', '')} title="Chấm đầu dòng"><i className="fa-solid fa-list-ul"></i></button>
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<br/>- ', '')} title="Gạch đầu dòng"><i className="fa-solid fa-minus"></i></button>
                                                            <div className="toolbar-divider"></div>
                                                            <button type="button" onClick={() => handleFormatText(block.id, '<span style="color:#b23a2c">', '</span>')} title="Chữ màu đỏ Cà phê"><i className="fa-solid fa-droplet" style={{color: '#b23a2c'}}></i></button>
                                                        </div>
                                                        <textarea 
                                                            id={`text-block-${block.id}`}
                                                            className="block-input text-block"
                                                            value={block.content}
                                                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                                            placeholder="Nhập nội dung đoạn văn... (Bôi đen chữ và chọn công cụ ở trên để trang trí)"
                                                        ></textarea>
                                                    </div>
                                                )}

                                                {block.type === 'image' && (
                                                    <div className="block-image-upload">
                                                        <input 
                                                            type="text" 
                                                            className="block-input url-input"
                                                            value={block.content}
                                                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                                            placeholder="Dán link ảnh (URL) vào đây HOẶC bấm nút tải lên ở dưới..."
                                                            style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px' }}
                                                        />
                                                        {block.content ? (
                                                            <div className="block-img-preview">
                                                                <img src={block.content} alt="Block" />
                                                            </div>
                                                        ) : (
                                                            <label className="block-upload-area">
                                                                <input type="file" accept="image/*" onChange={(e) => handleBlockImageUpload(block.id, e)} hidden />
                                                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                                                <span>Bấm để tải ảnh lên Cloud</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === 'video' && (
                                                    <div className="block-video-input">
                                                        <i className="fa-brands fa-youtube"></i>
                                                        <input 
                                                            type="text" 
                                                            className="block-input"
                                                            value={block.content}
                                                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                                            placeholder="Dán đường link YouTube vào đây (VD: https://youtube.com/...)"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="news-add-block-tray">
                                        <button type="button" className="btn-add-block" onClick={() => addBlock('text')}><i className="fa-solid fa-paragraph"></i> Thêm Đoạn văn</button>
                                        <button type="button" className="btn-add-block" onClick={() => addBlock('image')}><i className="fa-regular fa-image"></i> Thêm Hình ảnh</button>
                                        <button type="button" className="btn-add-block" onClick={() => addBlock('video')}><i className="fa-brands fa-youtube"></i> Thêm Video</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="news-footer">
                            <button type="button" className="news-btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Hủy bỏ</button>
                            <button type="button" className="news-btn-save" onClick={handleSaveStory} disabled={isSaving}>
                                {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk"></i> Đăng Bài Viết</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductStoryManage;