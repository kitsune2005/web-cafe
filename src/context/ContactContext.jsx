import React, { createContext, useContext, useEffect, useState } from "react";

const ContactContext = createContext();

const API_URL = "http://localhost:5000/api/contacts";

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================== LOAD DANH SÁCH LIÊN HỆ ==========================
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Lỗi tải liên hệ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ========================== GỬI LIÊN HỆ MỚI ==========================
  const sendContact = async (contactData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể gửi liên hệ");
    }

    // Đẩy phản hồi mới lên đầu danh sách State
    setContacts((prev) => [data.contact, ...prev]);

    return data;
  };

  // ========================== ĐÁNH DẤU ĐÃ XEM ==========================
  const markAsRead = async (id) => {
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: "PUT",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật");
    }

    // Cập nhật trạng thái 'read' cho bản ghi tương ứng trong mảng State
    setContacts((prev) =>
      prev.map((item) => (item.id === id ? data.contact : item))
    );
  };

  // ========================== XÓA LIÊN HỆ ==========================
  const deleteContact = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa");
    }

     // Lọc bỏ liên hệ ra khỏi mảng State
    setContacts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        loading,
        sendContact,
        fetchContacts,
        markAsRead,
        deleteContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => useContext(ContactContext);