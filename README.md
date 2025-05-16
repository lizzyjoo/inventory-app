# Sip N Slice Inventory Management System

This inventory management app helps businesses track products, manage categories, and maintain stock levels with an intuitive and responsive interface.

## Features

- Product Management: Add, edit, and delete products
- Category Organization: Organize products into customizable categories
- Search Functionality: Find products by name
- Sorting Options: Sort products by name or price (ascending or descending)
- Category Filtering: Filter products by category

## Technologies

- Backend: Node.js, Express.js
- Frontend: EJS templates, CSS, JavaScript
- Database: PostgreSQL
- Image Upload: Multer middleware
- Deployment: Railway platform

## Database Scheme

1. categories: Stores product categories

- id (Primary Key)
- category (Category name)
- (future update): color

2. inventory: Stores product information

- id (Primary Key)
- name (Product name)
- category_id (Foreign Key to categories)
- quantity
- price
- src (Product image path)
- description
- isdefault (Boolean flag for default products)

## Intended Future Updates

- Color coding scheme for the categories
- Use Authentication-based access control
- Export/import functionality for inventory data
