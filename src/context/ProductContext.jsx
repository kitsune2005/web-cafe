import React, { createContext, useState, useEffect, useContext } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đổi port theo đúng server.js của Boss (hiện tại là 5000)
  const API_URL = 'http://localhost:5000/api/products'; 

  // LẤY DỮ LIỆU TỪ BACKEND
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data || []); 
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // THÊM SẢN PHẨM MỚI (POST)
  const addProduct = async (newProduct) => {
    // Tự sinh ID nếu Backend chưa có hàm tự tăng
    const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
    const itemToAdd = { ...newProduct, id: newId, rating: newProduct.rating || 5 };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToAdd),
    });

    if (!response.ok) {
      // Ép văng lỗi để trang Admin hiển thị Toast
      throw new Error("Lỗi từ Backend"); 
    }
    
    const addedProduct = await response.json();
    setProducts(prev => [addedProduct, ...prev]); 
  };

  // XÓA SẢN PHẨM (DELETE)
  const deleteProduct = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Lỗi xóa từ Backend");
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // CẬP NHẬT SẢN PHẨM (PUT)
  const updateProduct = async (updatedProduct) => {
    const response = await fetch(`${API_URL}/${updatedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) throw new Error("Lỗi cập nhật từ Backend");
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  // 👉 THÊM MỚI: CẬP NHẬT TIỂU SỬ SẢN PHẨM (PATCH)
  const updateProductStory = async (id, shortDesc, longDesc) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortDesc, longDesc })
      });

      if (!response.ok) {
        throw new Error("Lỗi cập nhật tiểu sử từ Backend");
      }

      // Cập nhật State nội bộ cho mượt, không cần fetch lại nguyên list
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, shortDesc, longDesc } : product
      ));

      return true; // Báo về Admin là đã lưu thành công
    } catch (error) {
      console.error("Lỗi khi lưu tiểu sử API:", error);
      return false; // Báo lỗi
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return "0đ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      addProduct, 
      deleteProduct, 
      updateProduct, 
      updateProductStory, /* 👉 ĐÃ XUẤT KHẨU HÀM Ở ĐÂY */
      formatPrice, 
      refreshData: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);