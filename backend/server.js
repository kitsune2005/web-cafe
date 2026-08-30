const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'users.json');

// Middleware cho phép frontend gọi API
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Cho phép gửi file ảnh Base64 lớn
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// CHO PHÉP ĐỌC FILE TỪ FOLDER 'uploads'
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Hàm đọc dữ liệu từ file JSON (Users)
const readUsers = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Hàm ghi dữ liệu vào file JSON (Users)
const writeUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// API: Đăng ký thường
app.post('/api/register', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  const users = readUsers();
  
  // Kiểm tra trùng lặp
  const existingEmail = users.find((user) => user.email === email);
  const existingUsername = users.find((user) => user.username === username);

  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
  }
  if (existingUsername) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã có người sử dụng!' });
  }

  const newUser = {
    id: Date.now(),
    name,
    username,
    email,
    password,
    role: 'customer',
    avatar: '',
    provider: 'local',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ success: true, message: 'Đăng ký thành công!', user: newUser });
});

// API: Đăng nhập thường (SMART LOGIN)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Tên đăng nhập và mật khẩu!' });
  }

  const users = readUsers();
  
  const user = users.find((u) => 
    (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
  }

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công!',
    user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar 
    }
  });
});

// API: Đăng nhập bằng Google
app.post('/api/google-login', (req, res) => {
  const { name, email, googleId, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email Google không hợp lệ!' });
  }

  const users = readUsers();
  let user = users.find((u) => u.email === email);

  if (!user) {
    user = {
      id: Date.now(),
      name: name || 'Google User',
      username: email.split('@')[0], 
      email: email,
      password: '',
      role: 'customer',
      avatar: avatar || '',
      googleId: googleId || '',
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    writeUsers(users);

    return res.status(200).json({
      success: true,
      isNewUser: true,
      message: 'Tài khoản Google mới đã được tạo và đăng nhập thành công!',
      user: { 
          id: user.id, 
          name: user.name, 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          avatar: user.avatar 
      }
    });
  }

  return res.status(200).json({
    success: true,
    isNewUser: false,
    message: 'Đăng nhập Google thành công!',
    user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar 
    }
  });
});

// API: CẬP NHẬT THÔNG TIN VÀ RÚT GỌN LINK AVATAR
app.put('/api/update-profile', (req, res) => {
  const { id, name, email, avatar } = req.body;

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
  }

  // 1. Cập nhật tên và email nếu có
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;

  // 2. Xử lý Avatar nén thành file
  if (avatar) {
    if (avatar.startsWith('data:image')) {
      try {
        const matches = avatar.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          
          const filename = `avatar_${id}_${Date.now()}.${ext}`;
          const uploadPath = path.join(__dirname, 'uploads');
          
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
          }
          
          fs.writeFileSync(path.join(uploadPath, filename), base64Data, 'base64');
          users[userIndex].avatar = `http://localhost:${PORT}/uploads/${filename}`;
        }
      } catch (err) {
        console.error("Lỗi lưu ảnh:", err);
      }
    } 
    else if (avatar.startsWith('http')) {
      users[userIndex].avatar = avatar;
    }
  } 
  else if (avatar === '') {
    users[userIndex].avatar = '';
  }

  try {
    writeUsers(users);
    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật thành công!',
      user: users[userIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu dữ liệu!' });
  }
});


// =========================================================================
// ==================== KHU VỰC API QUẢN LÝ KHÁCH HÀNG (MỚI THÊM) ==========
// =========================================================================

// LẤY DANH SÁCH TOÀN BỘ NGƯỜI DÙNG (Cho Admin)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  // Giấu password đi trước khi gửi về frontend cho bảo mật
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.status(200).json(safeUsers);
});

// XÓA NGƯỜI DÙNG
app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const userId = Number(req.params.id);
  
  // Chống tự hủy: Không cho xóa Admin đầu tiên
  const userToDelete = users.find(u => u.id === userId);
  if (userToDelete && userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      return res.status(400).json({ success: false, message: 'Không thể xóa Admin duy nhất của hệ thống!' });
  }

  const filteredUsers = users.filter(u => u.id !== userId);
  writeUsers(filteredUsers);

  res.status(200).json({ success: true, message: 'Đã tiễn khách hàng lên đường!' });
});


// =========================================================================
// ==================== KHU VỰC API QUẢN LÝ SẢN PHẨM =======================
// =========================================================================

const PRODUCT_DB_FILE = path.join(__dirname, 'product.json');

// Hàm đọc file product.json
const readProducts = () => {
  try {
    if (!fs.existsSync(PRODUCT_DB_FILE)) {
      fs.writeFileSync(PRODUCT_DB_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(PRODUCT_DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Hàm ghi file product.json
const writeProducts = (products) => {
  fs.writeFileSync(PRODUCT_DB_FILE, JSON.stringify(products, null, 2), 'utf8');
};

// Hàm xịn sò: Biến chuỗi Base64 thành ảnh vật lý lưu vào thư mục 'uploads'
const saveProductImage = (base64String, prefix) => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String; 
  try {
    const matches = base64String.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const filename = `${prefix}_${Date.now()}.${ext}`;
      const uploadPath = path.join(__dirname, 'uploads');
      
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
      fs.writeFileSync(path.join(uploadPath, filename), base64Data, 'base64');
      
      return `http://localhost:${PORT}/uploads/${filename}`;
    }
  } catch (err) {
    console.error("Lỗi lưu ảnh sản phẩm:", err);
  }
  return base64String;
};

// 1. LẤY DANH SÁCH SẢN PHẨM (GET)
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.status(200).json(products);
});

// 2. THÊM MỚI SẢN PHẨM (POST)
app.post('/api/products', (req, res) => {
  const products = readProducts();
  let newProduct = req.body;

  newProduct.imageFront = saveProductImage(newProduct.imageFront, 'sp_front');
  newProduct.imageBack = saveProductImage(newProduct.imageBack, 'sp_back');

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// 3. CẬP NHẬT SẢN PHẨM (PUT)
app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const productId = Number(req.params.id);
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
  }

  let updatedProduct = req.body;
  updatedProduct.imageFront = saveProductImage(updatedProduct.imageFront, 'sp_front');
  updatedProduct.imageBack = saveProductImage(updatedProduct.imageBack, 'sp_back');

  products[index] = updatedProduct;
  writeProducts(products);

  res.status(200).json(updatedProduct);
});

// 4. XÓA SẢN PHẨM (DELETE)
app.delete('/api/products/:id', (req, res) => {
  let products = readProducts();
  const productId = Number(req.params.id);
  
  const filteredProducts = products.filter(p => p.id !== productId);
  writeProducts(filteredProducts);

  res.status(200).json({ success: true, message: 'Đã xóa thành công' });
});

// 5. CẬP NHẬT MỘT PHẦN SẢN PHẨM (PATCH) - Dành riêng cho Tiểu sử
app.patch('/api/products/:id', (req, res) => {
  const products = readProducts();
  const productId = Number(req.params.id);
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
  }

  // Lấy dữ liệu gửi lên và chỉ cập nhật 2 trường mô tả
  const { shortDesc, longDesc } = req.body;
  
  if (shortDesc !== undefined) products[index].shortDesc = shortDesc;
  if (longDesc !== undefined) products[index].longDesc = longDesc;

  writeProducts(products);

  res.status(200).json({ 
      success: true, 
      message: 'Cập nhật tiểu sử thành công', 
      product: products[index] 
  });
});

// Khởi động server (Chỉ xuất hiện 1 lần duy nhất ở đây)
app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại: http://localhost:${PORT}`);
});

// =========================================================================
// ======================= API QUẢN LÝ TIN TỨC =============================
// =========================================================================

const NEWS_DB_FILE = path.join(__dirname, 'news.json');

// Đọc tin tức
const readNews = () => {
  try {
    if (!fs.existsSync(NEWS_DB_FILE)) {
      fs.writeFileSync(NEWS_DB_FILE, '[]', 'utf8');
      return [];
    }

    const data = fs.readFileSync(NEWS_DB_FILE, 'utf8');

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Lỗi đọc news.json:', error);
    return [];
  }
};

// Ghi tin tức
const writeNews = (newsList) => {
  fs.writeFileSync(
    NEWS_DB_FILE,
    JSON.stringify(newsList, null, 2),
    'utf8'
  );
};


// =============================
// 1. GET TẤT CẢ TIN TỨC
// =============================

app.get('/api/news', (req, res) => {
  const newsList = readNews();

  res.status(200).json(newsList);
});


// =============================
// 2. GET CHI TIẾT TIN
// =============================

app.get('/api/news/:id', (req, res) => {
  const newsList = readNews();

  const id = Number(req.params.id);

  const news = newsList.find(
    item => item.id === id
  );

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  res.status(200).json(news);
});


// =============================
// 3. THÊM TIN TỨC
// =============================

app.post('/api/news', (req, res) => {
  const {
    title,
    excerpt,
    content,
    image,
    author,
    status,
    isFeatured
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tiêu đề và nội dung!'
    });
  }

  const newsList = readNews();

  const savedImage = image
    ? saveProductImage(image, 'news')
    : '';

  const newNews = {
    id: Date.now(),

    title,

    excerpt: excerpt || '',

    content,

    image: savedImage,

    author: author || 'Admin',

    status: status || 'published',

    isFeatured: Boolean(isFeatured),

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString()
  };

  newsList.push(newNews);

  writeNews(newsList);

  res.status(201).json({
    success: true,
    message: 'Thêm bài viết thành công!',
    news: newNews
  });
});


// =============================
// 4. SỬA TIN TỨC
// =============================

app.put('/api/news/:id', (req, res) => {
  const newsList = readNews();

  const id = Number(req.params.id);

  const index = newsList.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  const oldNews = newsList[index];

  let image = req.body.image;

  // Nếu ảnh mới là Base64 thì lưu thành file
  if (
    image &&
    image.startsWith('data:image')
  ) {
    image = saveProductImage(
      image,
      'news'
    );
  }

  newsList[index] = {
    ...oldNews,
    ...req.body,

    id: oldNews.id,

    image:
      image !== undefined
        ? image
        : oldNews.image,

    updatedAt: new Date().toISOString()
  };

  writeNews(newsList);

  res.status(200).json({
    success: true,
    message: 'Cập nhật bài viết thành công!',
    news: newsList[index]
  });
});


// =============================
// 5. XÓA TIN TỨC
// =============================

app.delete('/api/news/:id', (req, res) => {
  let newsList = readNews();

  const id = Number(req.params.id);

  const exists = newsList.some(
    item => item.id === id
  );

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  newsList = newsList.filter(
    item => item.id !== id
  );

  writeNews(newsList);

  res.status(200).json({
    success: true,
    message: 'Xóa bài viết thành công!'
  });
});

// =========================================================================
// ===================== API QUẢN LÝ LIÊN HỆ ================================
// =========================================================================

const CONTACT_DB_FILE = path.join(__dirname, 'contact.json');

const readContacts = () => {
  try {
    if (!fs.existsSync(CONTACT_DB_FILE)) {
      fs.writeFileSync(CONTACT_DB_FILE, '[]', 'utf8');
      return [];
    }

    const data = fs.readFileSync(CONTACT_DB_FILE, 'utf8');

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Lỗi đọc contact.json:", error);
    return [];
  }
};

const writeContacts = (contacts) => {
  fs.writeFileSync(
    CONTACT_DB_FILE,
    JSON.stringify(contacts, null, 2),
    'utf8'
  );
};


// 1. KHÁCH GỬI LIÊN HỆ
app.post('/api/contacts', (req, res) => {
  const {
    name,
    phone,
    email,
    message
  } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin!'
    });
  }

  const contacts = readContacts();

  const newContact = {
    id: Date.now(),

    name,
    phone,
    email,
    message,

    status: 'unread',

    createdAt: new Date().toISOString()
  };

  contacts.unshift(newContact);

  writeContacts(contacts);

  res.status(201).json({
    success: true,
    message: 'Gửi liên hệ thành công!',
    contact: newContact
  });
});


// 2. ADMIN LẤY DANH SÁCH LIÊN HỆ
app.get('/api/contacts', (req, res) => {
  const contacts = readContacts();

  res.status(200).json(contacts);
});


// 3. ADMIN ĐÁNH DẤU ĐÃ XEM
app.put('/api/contacts/:id/read', (req, res) => {
  const contacts = readContacts();

  const id = Number(req.params.id);

  const index = contacts.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy liên hệ!'
    });
  }

  contacts[index].status = 'read';

  writeContacts(contacts);

  res.status(200).json({
    success: true,
    contact: contacts[index]
  });
});


// 4. ADMIN XÓA LIÊN HỆ
app.delete('/api/contacts/:id', (req, res) => {
  let contacts = readContacts();

  const id = Number(req.params.id);

  const exists = contacts.some(
    item => item.id === id
  );

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy liên hệ!'
    });
  }

  contacts = contacts.filter(
    item => item.id !== id
  );

  writeContacts(contacts);

  res.status(200).json({
    success: true,
    message: 'Đã xóa liên hệ!'
  });
});