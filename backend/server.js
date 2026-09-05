const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); //   THÊM VŨ KHÍ BẮT FILE

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================================
// HÀM CHUNG: XỬ LÝ ẢNH & TỰ ĐỘNG CHIA THƯ MỤC CHO BASE64 (DÙNG CHO CÁC FORM CŨ)
// =========================================================================
const saveImage = (base64String, subFolder, prefix) => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String;

  try {
    const matches = base64String.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

      const mainUploadPath = path.join(__dirname, 'uploads');
      const subUploadPath = path.join(mainUploadPath, subFolder);

      if (!fs.existsSync(mainUploadPath)) fs.mkdirSync(mainUploadPath);
      if (!fs.existsSync(subUploadPath)) fs.mkdirSync(subUploadPath);

      fs.writeFileSync(path.join(subUploadPath, filename), base64Data, 'base64');

      return `http://localhost:${PORT}/uploads/${subFolder}/${filename}`;
    }
  } catch (err) {
    console.error(`Lỗi lưu ảnh thư mục ${subFolder}:`, err);
  }
  return base64String;
};

// =========================================================================
//   API MỚI: HỨNG FILE TỪ TRÌNH SOẠN THẢO (BLOCK EDITOR / GALLERY)
// =========================================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'uploads', 'products');
        // Tự động tạo thư mục nếu chưa có
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `editor_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy file ảnh đính kèm!' });
    }
    
    // Trả về URL đường dẫn chuẩn xác cho Frontend xài luôn
    const imageUrl = `http://localhost:${PORT}/uploads/products/${req.file.filename}`;
    res.status(200).json({ success: true, url: imageUrl, filename: req.file.filename });
});

// =========================================================================
// ==================== KHU VỰC API NGƯỜI DÙNG / AUTH ======================
// =========================================================================
const DB_FILE = path.join(__dirname, 'users.json');

const readUsers = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) { return []; }
};

const writeUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
};

app.post('/api/register', (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin!' });

  const users = readUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
  if (users.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'Username đã tồn tại!' });

  const newUser = { id: String(Date.now()), name, username, email, password, role: 'customer', avatar: '', provider: 'local', createdAt: new Date().toISOString() };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ success: true, message: 'Đăng ký thành công!', user: newUser });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Nhập thiếu thông tin!' });

  const users = readUsers();
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

  if (!user) return res.status(401).json({ success: false, message: 'Sai thông tin!' });
  res.status(200).json({ success: true, message: 'Đăng nhập thành công!', user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
});

app.post('/api/google-login', (req, res) => {
  const { name, email, googleId, avatar } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email lỗi!' });

  const users = readUsers();
  let user = users.find(u => u.email === email);

  if (!user) {
    user = { id: String(Date.now()), name: name || 'Google User', username: email.split('@')[0], email, password: '', role: 'customer', avatar: avatar || '', googleId: googleId || '', provider: 'google', createdAt: new Date().toISOString() };
    users.push(user);
    writeUsers(users);
    return res.status(200).json({ success: true, isNewUser: true, message: 'Tạo tài khoản Google mới!', user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
  }

  res.status(200).json({ success: true, isNewUser: false, message: 'Đăng nhập Google thành công!', user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
});

app.put('/api/update-profile', (req, res) => {
  const { id, name, email, avatar } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => String(u.id) === String(id)); 

  if (userIndex === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });

  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;

  if (avatar) {
    if (avatar.startsWith('data:image')) users[userIndex].avatar = saveImage(avatar, 'avatars', `avatar_${id}`);
    else if (avatar.startsWith('http')) users[userIndex].avatar = avatar;
  } else if (avatar === '') users[userIndex].avatar = '';

  try {
    writeUsers(users);
    res.status(200).json({ success: true, message: 'Cập nhật thành công!', user: users[userIndex] });
  } catch (error) { res.status(500).json({ success: false, message: 'Lỗi hệ thống!' }); }
});

app.get('/api/users', (req, res) => {
  const safeUsers = readUsers().map(({ password, ...rest }) => rest);
  res.status(200).json(safeUsers);
});

app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const userToDelete = users.find(u => String(u.id) === String(req.params.id));
  if (userToDelete && userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
    return res.status(400).json({ success: false, message: 'Không thể xóa Admin duy nhất!' });
  }

  writeUsers(users.filter(u => String(u.id) !== String(req.params.id)));
  res.status(200).json({ success: true, message: 'Đã xóa!' });
});


// =========================================================================
// ==================== KHU VỰC API QUẢN LÝ SẢN PHẨM =======================
// =========================================================================
const PRODUCT_DB_FILE = path.join(__dirname, 'product.json');

const readProducts = () => {
  try {
    if (!fs.existsSync(PRODUCT_DB_FILE)) { fs.writeFileSync(PRODUCT_DB_FILE, '[]', 'utf8'); return []; }
    const data = fs.readFileSync(PRODUCT_DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) { return []; }
};

const writeProducts = (products) => { fs.writeFileSync(PRODUCT_DB_FILE, JSON.stringify(products, null, 2), 'utf8'); };

app.get('/api/products', (req, res) => { res.status(200).json(readProducts()); });

app.post('/api/products', (req, res) => {
  const products = readProducts();
  let newProduct = req.body;

  newProduct.imageFront = saveImage(newProduct.imageFront, 'products', 'sp_front');
  newProduct.imageBack = saveImage(newProduct.imageBack, 'products', 'sp_back');
  newProduct.img = newProduct.imageFront;

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => String(p.id) === String(req.params.id)); 

  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });

  let updatedProduct = req.body;
  updatedProduct.imageFront = saveImage(updatedProduct.imageFront, 'products', 'sp_front');
  updatedProduct.imageBack = saveImage(updatedProduct.imageBack, 'products', 'sp_back');
  updatedProduct.img = updatedProduct.imageFront; 

  products[index] = updatedProduct;
  writeProducts(products);
  res.status(200).json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  let products = readProducts();
  const filteredProducts = products.filter(p => String(p.id) !== String(req.params.id));
  writeProducts(filteredProducts);
  res.status(200).json({ success: true, message: 'Đã xóa thành công' });
});

app.patch('/api/products/:id', (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });

  const { shortDesc, longDesc, stock, sold } = req.body;
  if (shortDesc !== undefined) products[index].shortDesc = shortDesc;
  if (longDesc !== undefined) products[index].longDesc = longDesc;
  if (stock !== undefined) products[index].stock = stock;
  if (sold !== undefined) products[index].sold = sold;

  writeProducts(products);
  res.status(200).json(products[index]);
});


// =========================================================================
// ======================= API QUẢN LÝ TIN TỨC =============================
// =========================================================================
const NEWS_DB_FILE = path.join(__dirname, 'news.json');

const readNews = () => {
  try {
    if (!fs.existsSync(NEWS_DB_FILE)) { fs.writeFileSync(NEWS_DB_FILE, '[]', 'utf8'); return []; }
    const data = fs.readFileSync(NEWS_DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) { return []; }
};

const writeNews = (newsList) => { fs.writeFileSync(NEWS_DB_FILE, JSON.stringify(newsList, null, 2), 'utf8'); };

const processContentBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map(block => {
    if (block.type === 'image' && block.url && block.url.startsWith('data:image')) {
      block.url = saveImage(block.url, 'news', 'block_img');
    }
    return block;
  });
};

app.get('/api/news', (req, res) => { res.status(200).json(readNews()); });

app.get('/api/news/:id', (req, res) => {
  const news = readNews().find(item => String(item.id) === String(req.params.id));
  if (!news) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
  res.status(200).json(news);
});

app.post('/api/news', (req, res) => {
  const { title, excerpt, content, contentBlocks, image, author, status, isFeatured } = req.body;
  const newsList = readNews();

  const savedCoverImage = image ? saveImage(image, 'news', 'news_cover') : '';
  const processedBlocks = processContentBlocks(contentBlocks);

  const newNews = {
    id: String(Date.now()),
    title, excerpt: excerpt || '', content: content || '', contentBlocks: processedBlocks,
    image: savedCoverImage, author: author || 'Admin', status: status || 'published',
    isFeatured: Boolean(isFeatured), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };

  newsList.push(newNews);
  writeNews(newsList);
  res.status(201).json({ success: true, message: 'Thêm bài viết thành công!', news: newNews });
});

app.put('/api/news/:id', (req, res) => {
  const newsList = readNews();
  const index = newsList.findIndex(item => String(item.id) === String(req.params.id));

  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });

  const oldNews = newsList[index];
  let newImage = req.body.image;

  if (newImage && newImage.startsWith('data:image')) newImage = saveImage(newImage, 'news', 'news_cover');
  else newImage = newImage !== undefined ? newImage : oldNews.image;

  newsList[index] = { ...oldNews, ...req.body, id: oldNews.id, contentBlocks: processContentBlocks(req.body.contentBlocks), image: newImage, updatedAt: new Date().toISOString() };
  writeNews(newsList);
  res.status(200).json({ success: true, message: 'Cập nhật thành công!', news: newsList[index] });
});

app.delete('/api/news/:id', (req, res) => {
  let newsList = readNews();
  if (!newsList.some(item => String(item.id) === String(req.params.id))) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });

  writeNews(newsList.filter(item => String(item.id) !== String(req.params.id)));
  res.status(200).json({ success: true, message: 'Xóa bài viết thành công!' });
});


// =========================================================================
// ===================== API QUẢN LÝ LIÊN HỆ ================================
// =========================================================================
const CONTACT_DB_FILE = path.join(__dirname, 'contact.json');

const readContacts = () => {
  try {
    if (!fs.existsSync(CONTACT_DB_FILE)) { fs.writeFileSync(CONTACT_DB_FILE, '[]', 'utf8'); return []; }
    const data = fs.readFileSync(CONTACT_DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) { return []; }
};
const writeContacts = (contacts) => { fs.writeFileSync(CONTACT_DB_FILE, JSON.stringify(contacts, null, 2), 'utf8'); };

app.post('/api/contacts', (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !email || !message) return res.status(400).json({ success: false, message: 'Nhập đủ thông tin!' });

  const contacts = readContacts();
  const newContact = { id: String(Date.now()), name, phone, email, message, status: 'unread', createdAt: new Date().toISOString() };
  contacts.unshift(newContact);
  writeContacts(contacts);
  res.status(201).json({ success: true, message: 'Thành công!', contact: newContact });
});

app.get('/api/contacts', (req, res) => { res.status(200).json(readContacts()); });

app.put('/api/contacts/:id/read', (req, res) => {
  const contacts = readContacts();
  const index = contacts.findIndex(item => String(item.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });

  contacts[index].status = 'read';
  writeContacts(contacts);
  res.status(200).json({ success: true, contact: contacts[index] });
});

app.delete('/api/contacts/:id', (req, res) => {
  let contacts = readContacts();
  if (!contacts.some(item => String(item.id) === String(req.params.id))) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });

  writeContacts(contacts.filter(item => String(item.id) !== String(req.params.id)));
  res.status(200).json({ success: true, message: 'Đã xóa!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại: http://localhost:${PORT}`);
});