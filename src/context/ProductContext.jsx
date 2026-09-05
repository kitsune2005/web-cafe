import React, { createContext, useState, useEffect, useContext } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/products'; 

  // 1. LẤY DỮ LIỆU TỪ BACKEND
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        // Ép kiểu
        setProducts(Array.isArray(data) ? data : (data.products || [])); 
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ API:", error);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. THÊM SẢN PHẨM MỚI (Bọc thép)
  const addProduct = async (newProduct) => {
    const safeProducts = Array.isArray(products) ? products : [];
    const newId = safeProducts.length > 0 ? Math.max(...safeProducts.map(p => Number(p.id) || 0)) + 1 : 1;
    const itemToAdd = { ...newProduct, id: String(newId), rating: newProduct.rating || 5, sold: 0 };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToAdd),
    });

    // Ép tải lại danh sách, từ chối nhận rác từ Server gây crash
    await fetchProducts(); 
  };

  // 3. XÓA SẢN PHẨM (Bọc thép)
  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await fetchProducts();
  };

  // 4. CẬP NHẬT TỪ ADMIN (Giữ nguyên "Đã bán")
  const updateProduct = async (updatedFields) => {
    // Tìm lấy data cũ đang hiển thị trên web
    const safeProducts = Array.isArray(products) ? products : [];
    const oldProduct = safeProducts.find(p => String(p.id) === String(updatedFields.id)) || {};

    //   Bí kíp: Lấy đồ mới của Admin đè lên đồ cũ (Số sold cũ sẽ được giữ nguyên an toàn)
    const finalPayload = { ...oldProduct, ...updatedFields };

    await fetch(`${API_URL}/${updatedFields.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    });

    // Cập nhật lại toàn web mượt mà không crash
    await fetchProducts();
  };

  // 5. CẬP NHẬT TIỂU SỬ
  const updateProductStory = async (id, shortDesc, longDesc) => {
    try {
      const safeProducts = Array.isArray(products) ? products : [];
      const oldProduct = safeProducts.find(p => String(p.id) === String(id)) || {};
      const finalPayload = { ...oldProduct, shortDesc, longDesc };

      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });

      await fetchProducts();
      return true; 
    } catch (error) {
      console.error("Lỗi khi lưu tiểu sử:", error);
      return false; 
    }
  };

  // 6. TRỪ KHO BỌC THÉP CHO CHECKOUT
  const deductStock = async (cartItems) => {
    try {
      const safeProducts = Array.isArray(products) ? products : [];

      for (const cartItem of cartItems) {
        // Tìm số cũ trên giao diện
        const oldProduct = safeProducts.find(p => String(p.id) === String(cartItem.id));
        if (!oldProduct) continue;

        // Tính số lượng mới
        const newStock = Math.max(0, (Number(oldProduct.stock) || 0) - Number(cartItem.quantity));
        const newSold = (Number(oldProduct.sold) || 0) + Number(cartItem.quantity);

        const finalPayload = { ...oldProduct, stock: newStock, sold: newSold };

        await fetch(`${API_URL}/${cartItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload)
        });
      }

      // Xong xuôi thì load lại danh sách 1 lần duy nhất
      await fetchProducts(); 
    } catch (error) {
      console.error("Lỗi khi trừ kho:", error);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return "0đ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
  };

  return (
    <ProductContext.Provider value={{ 
      products: Array.isArray(products) ? products : [], // Rào cuối cùng chống sập
      loading, 
      addProduct, 
      deleteProduct, 
      updateProduct, 
      updateProductStory,
      deductStock, 
      formatPrice, 
      refreshData: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);