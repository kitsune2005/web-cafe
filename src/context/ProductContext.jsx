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
    const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
    const itemToAdd = { ...newProduct, id: newId, rating: newProduct.rating || 5 };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToAdd),
    });

    if (!response.ok) throw new Error("Lỗi từ Backend"); 
    
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

  // CẬP NHẬT TIỂU SỬ SẢN PHẨM (PATCH)
  const updateProductStory = async (id, shortDesc, longDesc) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortDesc, longDesc })
      });

      if (!response.ok) throw new Error("Lỗi cập nhật tiểu sử từ Backend");

      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, shortDesc, longDesc } : product
      ));

      return true; 
    } catch (error) {
      console.error("Lỗi khi lưu tiểu sử API:", error);
      return false; 
    }
  };

  // 👉 HÀM MỚI: TRỪ KHO & TĂNG SỐ LƯỢNG ĐÃ BÁN (Tích hợp Optimistic Update)
  const deductStock = async (cartItems) => {
    // 1. ÉP GIAO DIỆN TRỪ KHO NGAY LẬP TỨC ĐỂ KHÁCH THẤY CHỮ "HẾT HÀNG" LIỀN
    setProducts(prevProducts => prevProducts.map(prod => {
      const itemInCart = cartItems.find(c => c.id === prod.id);
      if (itemInCart) {
        return {
          ...prod,
          stock: Math.max(0, (prod.stock || 0) - itemInCart.quantity),
          sold: (prod.sold || 0) + itemInCart.quantity
        };
      }
      return prod;
    }));

    // 2. GỌI API NGẦM PHÍA SAU ĐỂ LƯU VÀO DATABASE MÀ KHÔNG LÀM LAG TRANG
    try {
      const updatePromises = cartItems.map(async (cartItem) => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) return;

        const newStock = Math.max(0, (product.stock || 0) - cartItem.quantity);
        const newSold = (product.sold || 0) + cartItem.quantity;

        // Bắn API PATCH để cập nhật 2 trường này trên Database
        await fetch(`${API_URL}/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock, sold: newSold })
        });
      });

      // Chờ Database xử lý xong xuôi hết
      await Promise.all(updatePromises);

    } catch (error) {
      console.error("Lỗi khi đồng bộ Kho bãi trên Database:", error);
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
      updateProductStory,
      deductStock, /* 👉 KÉO HÀM NÀY RA CHO CÁC TRANG KHÁC DÙNG */
      formatPrice, 
      refreshData: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);