import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const ContactContext = createContext();

const API_URL =
  "http://localhost:5000/api/contacts";

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // ==========================
  // LOAD
  // ==========================

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(API_URL);

      const data =
        await response.json();

      setContacts(data);

    } catch (error) {
      console.error(
        "Lỗi tải liên hệ:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchContacts();
  }, []);


  // ==========================
  // GỬI
  // ==========================

  const sendContact =
    async (contactData) => {

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              contactData
            )
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Không thể gửi liên hệ"
        );
      }

      setContacts(prev => [
        data.contact,
        ...prev
      ]);

      return data;
    };


  // ==========================
  // ĐÃ XEM
  // ==========================

  const markAsRead = async (id) => {
    const response =
      await fetch(
        `${API_URL}/${id}/read`,
        {
          method: "PUT"
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Không thể cập nhật"
      );
    }

    setContacts(prev =>
      prev.map(item =>
        item.id === id
          ? data.contact
          : item
      )
    );
  };


  // ==========================
  // XÓA
  // ==========================

  const deleteContact =
    async (id) => {

      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE"
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Không thể xóa"
        );
      }

      setContacts(prev =>
        prev.filter(
          item => item.id !== id
        )
      );
    };


  return (
    <ContactContext.Provider
      value={{
        contacts,
        loading,
        sendContact,
        fetchContacts,
        markAsRead,
        deleteContact
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () =>
  useContext(ContactContext);