const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
const dirs = {
    avatars: path.join(uploadsDir, 'avatars'),
    products: path.join(uploadsDir, 'products'),
    news: path.join(uploadsDir, 'news')
};

// 1. Tạo thư mục con nếu chưa có
Object.values(dirs).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

console.log('🦊 Kitsune đang bắt đầu dọn nhà...');

// 2. Quét file và chuyển chuồng
const files = fs.readdirSync(uploadsDir);
let moveCount = 0;

files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    if (fs.statSync(filePath).isFile()) {
        let targetDir = null;
        if (file.startsWith('avatar_')) targetDir = dirs.avatars;
        else if (file.startsWith('sp_')) targetDir = dirs.products;
        else if (file.startsWith('news_') || file.startsWith('block_img_')) targetDir = dirs.news;

        if (targetDir) {
            fs.renameSync(filePath, path.join(targetDir, file));
            console.log(`🚚 Đã dọn: ${file}`);
            moveCount++;
        }
    }
});

// 3. Sửa lại sổ hộ khẩu (Database)
const updateDB = (filename, oldStr, newStr) => {
    const dbPath = path.join(__dirname, filename);
    if (fs.existsSync(dbPath)) {
        let data = fs.readFileSync(dbPath, 'utf8');
        // Thay thế hàng loạt đường dẫn cũ thành mới
        data = data.split(oldStr).join(newStr);
        fs.writeFileSync(dbPath, data, 'utf8');
        console.log(`✅ Đã cập nhật sổ hộ khẩu: ${filename}`);
    }
};

updateDB('users.json', '/uploads/avatar_', '/uploads/avatars/avatar_');
updateDB('product.json', '/uploads/sp_', '/uploads/products/sp_');
updateDB('news.json', '/uploads/news_', '/uploads/news/news_');

console.log(`🎉 Xong! Đã dọn dẹp gọn gàng ${moveCount} file. Boss Đạt có thể xóa file migrate.js này đi rồi nhé!`);