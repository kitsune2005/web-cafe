import React, { createContext, useState, useEffect, useContext } from "react";

const NewsContext = createContext();

// Đổi port theo đúng server.js của Boss (hiện tại là 5000)
const API_URL = "http://localhost:5000/api/news";

export const NewsProvider = ({ children }) => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================== LOAD TIN TỨC ==========================
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ========================== THÊM BÀI VIẾT ==========================
  const addNews = async (newsData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm bài viết");
    }

    setNewsList((prev) => [...prev, data.news]);

    return data.news;
  };

  // ========================== SỬA BÀI VIẾT ==========================
  const updateNews = async (newsData) => {
    const response = await fetch(`${API_URL}/${newsData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể sửa bài viết");
    }

    setNewsList((prev) =>
      prev.map((item) => (item.id === newsData.id ? data.news : item))
    );

    return data.news;
  };

  // ========================== XÓA BÀI VIẾT ==========================
  const deleteNews = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa bài viết");
    }

    setNewsList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <NewsContext.Provider
      value={{
        newsList,
        loading,
        fetchNews,
        addNews,
        updateNews,
        deleteNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);