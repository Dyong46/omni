USE omni_sales;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    parent_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id)
            ON DELETE SET NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image VARCHAR(255),
    category_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category
      FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL
);

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel ENUM('offline', 'tiktok', 'shopee') NOT NULL,
    customer_name VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    shipping_address TEXT,
    status VARCHAR(50),
    payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    total_amount INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
     id INT AUTO_INCREMENT PRIMARY KEY,
     order_id INT NOT NULL,
     product_id INT NOT NULL,
     quantity INT NOT NULL,
     price INT NOT NULL,
     CONSTRAINT fk_order_items_order
         FOREIGN KEY (order_id) REFERENCES orders(id)
             ON DELETE CASCADE,
     CONSTRAINT fk_order_items_product
         FOREIGN KEY (product_id) REFERENCES products(id)
             ON DELETE RESTRICT
);

CREATE TABLE app_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# Import data
INSERT INTO categories (id, name, parent_id) VALUES
    (1, 'Electronics', NULL),
    (2, 'Accessories', NULL),
    (3, 'Mobile Phones', 1),
    (4, 'Laptops', 1),
    (5, 'Chargers', 2),
    (6, 'Headphones', 2),
    (7, 'Tablets', 1),
    (8, 'Smart Watches', 1),
    (9, 'Cameras', 1),
    (10, 'Gaming', 1),
    (11, 'Cables & Adapters', 2),
    (12, 'Phone Cases', 2),
    (13, 'Screen Protectors', 2),
    (14, 'Keyboards & Mice', 2),
    (15, 'Monitors', 1);

INSERT INTO products (id, name, price, quantity, image, category_id) VALUES
    (1, 'iPhone 15 Pro', 30000000, 10, 'iphone15pro.jpg', 3),
    (2, 'Samsung Galaxy S24', 22000000, 15, 'galaxy-s24.jpg', 3),
    (3, 'MacBook Air M2', 28000000, 5, 'macbook-air-m2.jpg', 4),
    (4, 'Dell XPS 13', 26000000, 7, 'dell-xps-13.jpg', 4),
    (5, 'Apple 20W Charger', 450000, 50, 'apple-20w.jpg', 5),
    (6, 'Anker Fast Charger 30W', 550000, 40, 'anker-30w.jpg', 5),
    (7, 'AirPods Pro 2', 6200000, 20, 'airpods-pro-2.jpg', 6),
    (8, 'Sony WH-1000XM5', 8900000, 8, 'sony-xm5.jpg', 6),
    -- Mobile Phones
    (9, 'iPhone 15', 25000000, 12, 'iphone15.jpg', 3),
    (10, 'iPhone 14 Pro', 23000000, 9, 'iphone14pro.jpg', 3),
    (11, 'Samsung Galaxy S23', 18000000, 14, 'galaxy-s23.jpg', 3),
    (12, 'Samsung Galaxy A54', 9000000, 30, 'galaxy-a54.jpg', 3),
    (13, 'Xiaomi 13 Pro', 16000000, 11, 'xiaomi-13-pro.jpg', 3),
    (14, 'OPPO Reno10 Pro', 9500000, 18, 'oppo-reno10.jpg', 3),
    (15, 'Vivo V27 Pro', 8500000, 22, 'vivo-v27.jpg', 3),
    (16, 'Google Pixel 7', 17000000, 7, 'pixel-7.jpg', 3),
    (17, 'OnePlus 11', 15000000, 13, 'oneplus-11.jpg', 3),
    (18, 'Realme GT3', 11000000, 16, 'realme-gt3.jpg', 3),
    -- Laptops
    (19, 'MacBook Pro 14 M3', 45000000, 4, 'macbook-pro-14.jpg', 4),
    (20, 'MacBook Pro 16 M3', 62000000, 3, 'macbook-pro-16.jpg', 4),
    (21, 'HP Spectre x360 14', 32000000, 6, 'hp-spectre-x360.jpg', 4),
    (22, 'Lenovo ThinkPad X1 Carbon', 35000000, 5, 'thinkpad-x1.jpg', 4),
    (23, 'ASUS ROG Zephyrus G14', 38000000, 4, 'rog-zephyrus-g14.jpg', 4),
    (24, 'MSI Stealth 15', 30000000, 6, 'msi-stealth-15.jpg', 4),
    (25, 'Acer Swift 5', 22000000, 9, 'acer-swift-5.jpg', 4),
    (26, 'LG Gram 14', 28000000, 7, 'lg-gram-14.jpg', 4),
    (27, 'Microsoft Surface Laptop 5', 33000000, 5, 'surface-laptop-5.jpg', 4),
    (28, 'Razer Blade 15', 55000000, 3, 'razer-blade-15.jpg', 4),
    -- Chargers
    (29, 'Baseus 65W GaN Charger', 650000, 60, 'baseus-65w.jpg', 5),
    (30, 'Ugreen 100W GaN Charger', 890000, 45, 'ugreen-100w.jpg', 5),
    (31, 'Samsung 25W Super Fast Charger', 350000, 80, 'samsung-25w.jpg', 5),
    (32, 'Xiaomi 67W Turbo Charger', 420000, 55, 'xiaomi-67w.jpg', 5),
    (33, 'Belkin 30W USB-C Charger', 750000, 35, 'belkin-30w.jpg', 5),
    (34, 'RavPower 61W PD Charger', 680000, 30, 'ravpower-61w.jpg', 5),
    (35, 'Aukey 90W GaN Charger', 920000, 25, 'aukey-90w.jpg', 5),
    (36, 'Apple MagSafe Charger 15W', 1200000, 40, 'magsafe-15w.jpg', 5),
    -- Headphones
    (37, 'Bose QuietComfort 45', 7500000, 12, 'bose-qc45.jpg', 6),
    (38, 'Apple AirPods 3', 4200000, 25, 'airpods-3.jpg', 6),
    (39, 'Samsung Galaxy Buds2 Pro', 4500000, 18, 'galaxy-buds2-pro.jpg', 6),
    (40, 'Jabra Evolve2 75', 9800000, 6, 'jabra-evolve2-75.jpg', 6),
    (41, 'Anker Soundcore Q45', 1200000, 40, 'soundcore-q45.jpg', 6),
    (42, 'JBL Tune 770NC', 2200000, 30, 'jbl-tune-770nc.jpg', 6),
    (43, 'Sennheiser HD 450BT', 3200000, 15, 'sennheiser-hd450.jpg', 6),
    (44, 'Beats Studio Pro', 8900000, 10, 'beats-studio-pro.jpg', 6),
    -- Tablets
    (45, 'iPad Pro 12.9 M2', 29000000, 6, 'ipad-pro-129.jpg', 7),
    (46, 'iPad Air 5', 18000000, 10, 'ipad-air-5.jpg', 7),
    (47, 'iPad mini 6', 13000000, 14, 'ipad-mini-6.jpg', 7),
    (48, 'Samsung Galaxy Tab S9', 22000000, 8, 'galaxy-tab-s9.jpg', 7),
    (49, 'Samsung Galaxy Tab A8', 7500000, 20, 'galaxy-tab-a8.jpg', 7),
    (50, 'Xiaomi Pad 6 Pro', 8900000, 16, 'xiaomi-pad-6.jpg', 7),
    (51, 'Lenovo Tab P12', 9500000, 12, 'lenovo-tab-p12.jpg', 7),
    (52, 'Microsoft Surface Pro 9', 35000000, 5, 'surface-pro-9.jpg', 7),
    -- Smart Watches
    (53, 'Apple Watch Series 9', 12000000, 15, 'apple-watch-s9.jpg', 8),
    (54, 'Apple Watch Ultra 2', 22000000, 7, 'apple-watch-ultra2.jpg', 8),
    (55, 'Samsung Galaxy Watch 6', 7500000, 18, 'galaxy-watch-6.jpg', 8),
    (56, 'Garmin Fenix 7 Pro', 18000000, 6, 'garmin-fenix-7.jpg', 8),
    (57, 'Fitbit Sense 2', 5500000, 20, 'fitbit-sense2.jpg', 8),
    (58, 'Xiaomi Watch S1 Pro', 4200000, 25, 'xiaomi-watch-s1.jpg', 8),
    (59, 'Huawei Watch GT4', 5800000, 16, 'huawei-gt4.jpg', 8),
    (60, 'Amazfit GTR 4', 3500000, 30, 'amazfit-gtr4.jpg', 8),
    -- Cameras
    (61, 'Sony Alpha A7 IV', 65000000, 3, 'sony-a7iv.jpg', 9),
    (62, 'Canon EOS R6 Mark II', 68000000, 3, 'canon-r6-ii.jpg', 9),
    (63, 'Nikon Z6 II', 55000000, 4, 'nikon-z6ii.jpg', 9),
    (64, 'Sony ZV-E10', 18000000, 10, 'sony-zve10.jpg', 9),
    (65, 'Canon EOS M50 Mark II', 17000000, 9, 'canon-m50-ii.jpg', 9),
    (66, 'Fujifilm X-T5', 45000000, 4, 'fujifilm-xt5.jpg', 9),
    (67, 'GoPro Hero 12 Black', 11000000, 12, 'gopro-hero12.jpg', 9),
    (68, 'DJI Osmo Action 4', 9500000, 14, 'dji-osmo-action4.jpg', 9),
    -- Gaming
    (69, 'PlayStation 5 Slim', 14000000, 8, 'ps5-slim.jpg', 10),
    (70, 'Xbox Series X', 13500000, 7, 'xbox-series-x.jpg', 10),
    (71, 'Nintendo Switch OLED', 8500000, 15, 'switch-oled.jpg', 10),
    (72, 'Razer DeathAdder V3', 1800000, 35, 'razer-deathadder-v3.jpg', 10),
    (73, 'Logitech G Pro X Superlight 2', 2200000, 28, 'gpro-superlight2.jpg', 10),
    (74, 'SteelSeries Arctis Nova Pro', 6500000, 10, 'arctis-nova-pro.jpg', 10),
    (75, 'ASUS ROG Ally', 18000000, 6, 'rog-ally.jpg', 10),
    (76, 'Steam Deck OLED', 16000000, 5, 'steam-deck-oled.jpg', 10),
    -- Cables & Adapters
    (77, 'Anker USB-C to USB-C Cable 2m', 250000, 100, 'anker-usbc-cable.jpg', 11),
    (78, 'Apple USB-C to Lightning Cable 1m', 450000, 80, 'apple-usbc-lightning.jpg', 11),
    (79, 'Ugreen HDMI 2.1 Cable 2m', 350000, 70, 'ugreen-hdmi21.jpg', 11),
    (80, 'Baseus USB-C Hub 7-in-1', 850000, 40, 'baseus-hub-7in1.jpg', 11),
    (81, 'Ugreen USB-C to DisplayPort Adapter', 450000, 50, 'ugreen-usbc-dp.jpg', 11),
    (82, 'Apple USB-C to MagSafe 3 Cable', 1200000, 35, 'apple-magsafe3.jpg', 11),
    -- Phone Cases
    (83, 'Apple Clear Case iPhone 15', 950000, 45, 'apple-clear-case-15.jpg', 12),
    (84, 'Spigen Tough Armor iPhone 15 Pro', 450000, 60, 'spigen-tough-15pro.jpg', 12),
    (85, 'OtterBox Defender Samsung S24', 650000, 40, 'otterbox-s24.jpg', 12),
    (86, 'Casetify Impact Case iPhone 15 Pro', 1200000, 30, 'casetify-15pro.jpg', 12),
    (87, 'UAG Monarch iPhone 15', 980000, 35, 'uag-monarch-15.jpg', 12),
    -- Screen Protectors
    (88, 'Belkin ScreenForce iPhone 15 Pro', 650000, 60, 'belkin-screen-15pro.jpg', 13),
    (89, 'ZAGG InvisibleShield Samsung S24', 550000, 55, 'zagg-s24.jpg', 13),
    (90, 'Spigen EZ Fit iPad Pro 12.9', 450000, 40, 'spigen-ipad-pro.jpg', 13),
    (91, 'amFilm Galaxy Tab S9 Protector', 320000, 50, 'amfilm-tab-s9.jpg', 13),
    -- Keyboards & Mice
    (92, 'Logitech MX Keys S', 2800000, 20, 'mx-keys-s.jpg', 14),
    (93, 'Apple Magic Keyboard', 3200000, 18, 'magic-keyboard.jpg', 14),
    (94, 'Keychron K2 Pro', 2500000, 22, 'keychron-k2-pro.jpg', 14),
    (95, 'Logitech MX Master 3S', 2200000, 25, 'mx-master-3s.jpg', 14),
    (96, 'Apple Magic Mouse', 2400000, 20, 'magic-mouse.jpg', 14),
    (97, 'Razer Pro Click Mini', 1800000, 28, 'razer-pro-click-mini.jpg', 14),
    -- Monitors
    (98, 'LG UltraGear 27GP850-B 165Hz', 9500000, 8, 'lg-27gp850.jpg', 15),
    (99, 'Samsung Odyssey G7 32"', 16000000, 5, 'samsung-g7-32.jpg', 15),
    (100, 'Dell UltraSharp U2723QE 4K', 18000000, 6, 'dell-u2723qe.jpg', 15);

INSERT INTO customers (id, name, email, phone) VALUES
    (1, 'Nguyen Van A', 'a.nguyen@gmail.com', '0901234567'),
    (2, 'Tran Thi B', 'b.tran@gmail.com', '0912345678'),
    (3, 'Le Minh C', NULL, '0987654321'),
    (4, 'Pham Hoang D', 'd.pham@gmail.com', '0933123123'),
    (5, 'Hoang Thi Lan', 'lan.hoang@gmail.com', '0908765432'),
    (6, 'Vu Quoc Bao', 'bao.vu@gmail.com', '0919876543'),
    (7, 'Dang Thi Thu', NULL, '0976543210'),
    (8, 'Nguyen Thanh Tung', 'tung.nguyen@yahoo.com', '0944321987'),
    (9, 'Tran Van Duc', 'duc.tran@gmail.com', '0955432198'),
    (10, 'Le Thi Hoa', 'hoa.le@gmail.com', '0966543219'),
    (11, 'Bui Minh Khoa', 'khoa.bui@gmail.com', '0977654320'),
    (12, 'Do Thi Mai', NULL, '0988765431'),
    (13, 'Nguyen Duc Long', 'long.nguyen@gmail.com', '0911876542'),
    (14, 'Pham Thi Ngoc', 'ngoc.pham@yahoo.com', '0922987653'),
    (15, 'Vo Van Hieu', 'hieu.vo@gmail.com', '0933098764'),
    (16, 'Trinh Thi Yen', 'yen.trinh@gmail.com', '0944109875'),
    (17, 'Luong Van Phuc', NULL, '0955210986'),
    (18, 'Cao Thi Bich', 'bich.cao@gmail.com', '0966321097'),
    (19, 'Dinh Quoc Hung', 'hung.dinh@gmail.com', '0977432108'),
    (20, 'Ngo Thi Linh', 'linh.ngo@yahoo.com', '0988543219'),
    (21, 'Ly Van Thanh', 'thanh.ly@gmail.com', '0901654320'),
    (22, 'Mai Thi Huong', 'huong.mai@gmail.com', '0912765431'),
    (23, 'Tran Quoc Viet', NULL, '0987876542'),
    (24, 'Nguyen Thi Kim', 'kim.nguyen@gmail.com', '0934987653'),
    (25, 'Ho Van Nam', 'nam.ho@gmail.com', '0945098764'),
    (26, 'Doan Thi Phuong', 'phuong.doan@yahoo.com', '0956109875'),
    (27, 'Chu Minh Quan', 'quan.chu@gmail.com', '0967210986'),
    (28, 'Vuong Thi Thao', NULL, '0978321097'),
    (29, 'Phan Van Kien', 'kien.phan@gmail.com', '0989432108'),
    (30, 'Truong Thi Diem', 'diem.truong@gmail.com', '0902543219'),
    (31, 'Lam Van Tri', 'tri.lam@gmail.com', '0913654320'),
    (32, 'Huynh Thi Nga', 'nga.huynh@yahoo.com', '0924765431'),
    (33, 'To Quoc Thai', NULL, '0935876542'),
    (34, 'Nguyen Van Tai', 'tai.nguyen@gmail.com', '0946987653'),
    (35, 'Le Thi Tuyet', 'tuyet.le@gmail.com', '0957098764'),
    (36, 'Tran Minh Hieu', 'hieu.tran@gmail.com', '0968109875'),
    (37, 'Pham Van Phong', NULL, '0979210986'),
    (38, 'Hoang Thi Dung', 'dung.hoang@yahoo.com', '0980321097'),
    (39, 'Vu Thi Cuc', 'cuc.vu@gmail.com', '0903432108'),
    (40, 'Dang Van Son', 'son.dang@gmail.com', '0914543219'),
    (41, 'Nguyen Thi Cam', 'cam.nguyen@gmail.com', '0925654320'),
    (42, 'Tran Van Loi', NULL, '0936765431'),
    (43, 'Le Quoc Anh', 'anh.le@gmail.com', '0947876542'),
    (44, 'Bui Thi Hoa', 'hoa.bui@yahoo.com', '0958987653'),
    (45, 'Do Van Tuan', 'tuan.do@gmail.com', '0969098764'),
    (46, 'Vo Thi Loan', 'loan.vo@gmail.com', '0970109875'),
    (47, 'Trinh Minh Duc', NULL, '0981210986'),
    (48, 'Cao Van Tinh', 'tinh.cao@gmail.com', '0904321097'),
    (49, 'Dinh Thi Thuy', 'thuy.dinh@gmail.com', '0915432108'),
    (50, 'Ngo Van Binh', 'binh.ngo@gmail.com', '0926543219');