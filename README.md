# Items API

A RESTful API for managing items with user authentication, built with Node.js, Express, and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation Steps](#installation-steps)
  - [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Items Endpoints](#items-endpoints)
- [Database Schema](#database-schema)
- [Design Decisions and Architecture](#design-decisions-and-architecture)
- [Security Features](#security-features)
- [Error Handling](#error-handling)

## Features

- User authentication with JWT
- CRUD operations for items
- Rate limiting to prevent abuse
- Metadata logging for item operations
- PostgreSQL database integration
- Docker support for easy setup
- Pagination, sorting, and filtering for item listings

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (or Docker for containerized setup)

### Environment Variables

Create a `.env` file in the root directory with the following variables: 

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=items_db
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd items-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

### Docker Setup

1. Start the containers:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- pgAdmin on port 5050 (accessible at http://localhost:5050)

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body**: 
```json
{
  "username": "string",
  "password": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body**: 
```json
{
  "username": "string",
  "password": "string"
}
```

### Items Endpoints

All items endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

#### Create Item
- **POST** `/api/items`
- **Body**:
```json
{
  "name": "string",
  "description": "string",
  "price": number
}
```

#### Get Items
- **GET** `/api/items`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sortBy`: Field to sort by (default: id)
  - `sortOrder`: ASC or DESC (default: ASC)
  - `filterKey`: Field to filter by
  - `filterValue`: Value to filter for

#### Get Item by ID
- **GET** `/api/items/:id`

#### Update Item
- **PUT** `/api/items/:id`
- **Body**: Same as Create Item

#### Delete Item
- **DELETE** `/api/items/:id`

#### Get Item Metadata
- **GET** `/api/items/:id/metadata`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Items Table
```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Design Decisions and Architecture

1. **Authentication & Authorization**
   - JWT-based authentication for stateless operation
   - Tokens expire after 24 hours
   - Passwords are hashed using bcrypt

2. **Rate Limiting**
   - 100 requests per IP address per 15 minutes
   - Helps prevent API abuse

3. **Error Handling**
   - Centralized error handling middleware
   - Custom error classes for different types of errors
   - Environment-based error detail exposure

4. **Logging**
   - Metadata logging for item operations
   - Stored in JSON file for simplicity
   - Includes user agent and IP address information

5. **Database**
   - PostgreSQL for robust relational data storage
   - Connection pooling for better performance
   - pg_stat_statements extension for query analysis

## Security Features

1. Rate limiting to prevent brute force attacks
2. JWT authentication
3. Password hashing
4. Input validation
5. Error message sanitization in production
6. Secure headers configuration

## Error Handling

The API uses a hierarchical error system with different error types:
- ValidationError (400)
- AuthenticationError (401)
- ForbiddenError (403)
- NotFoundError (404)
- DatabaseError (500)

Error responses include:
- Error message
- Status code
- Detailed error information (development only)