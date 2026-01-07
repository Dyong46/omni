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
    (6, 'Headphones', 2);

INSERT INTO products (id, name, price, quantity, image, category_id) VALUES
    (1, 'iPhone 15 Pro', 30000000, 10, 'iphone15pro.jpg', 3),
    (2, 'Samsung Galaxy S24', 22000000, 15, 'galaxy-s24.jpg', 3),
    (3, 'MacBook Air M2', 28000000, 5, 'macbook-air-m2.jpg', 4),
    (4, 'Dell XPS 13', 26000000, 7, 'dell-xps-13.jpg', 4),
    (5, 'Apple 20W Charger', 450000, 50, 'apple-20w.jpg', 5),
    (6, 'Anker Fast Charger 30W', 550000, 40, 'anker-30w.jpg', 5),
    (7, 'AirPods Pro 2', 6200000, 20, 'airpods-pro-2.jpg', 6),
    (8, 'Sony WH-1000XM5', 8900000, 8, 'sony-xm5.jpg', 6);

INSERT INTO customers (id, name, email, phone) VALUES
    (1, 'Nguyen Van A', 'a.nguyen@gmail.com', '0901234567'),
    (2, 'Tran Thi B', 'b.tran@gmail.com', '0912345678'),
    (3, 'Le Minh C', NULL, '0987654321'),
    (4, 'Pham Hoang D', 'd.pham@gmail.com', '0933123123');