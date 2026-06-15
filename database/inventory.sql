-- Database schema for Smart Inventory Management System

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(255),
    contact_number VARCHAR(50),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    supplier_id INTEGER,
    image VARCHAR(255),
    status VARCHAR(50),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Insert a default admin user (password: admin123 hashed using bcrypt - wait, we'll hash it in the script or use a pre-hashed string)
INSERT OR IGNORE INTO users (first_name, last_name, username, email, password, role) 
VALUES ('System', 'Admin', 'admin', 'admin@example.com', '$2b$10$DMtbhPG27FF5/1eGPZESTuwFCnMDbFKJ6fRD6SEEk5s/IES2kRfEi', 'Administrator');

-- Insert dummy suppliers
INSERT OR IGNORE INTO suppliers (supplier_id, supplier_name, contact_name, email, contact_number, address) VALUES
(1, 'Dell Inc.', 'John Smith', 'john@dell.com', '+1-555-0101', '123 Tech Street, Austin, TX'),
(2, 'Logitech', 'Sarah Johnson', 'sarah@logitech.com', '+1-555-0102', '456 Mouse Ave, Newark, CA');

-- Insert dummy products
INSERT OR IGNORE INTO products (product_id, product_name, category, price, quantity, supplier_id, status, description) VALUES
(1, 'Laptop Dell Inspiron', 'Electronics', 899.99, 15, 1, 'In Stock', '15.6" Full HD Laptop with Intel Core i5'),
(2, 'Wireless Mouse', 'Accessories', 29.99, 50, 2, 'In Stock', 'Ergonomic wireless mouse with USB receiver');
