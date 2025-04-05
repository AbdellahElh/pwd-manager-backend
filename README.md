# Password Manager Backend

This repository contains the backend service for a Web Browser Password Manager with Face Authentication. The service is built with Node.js, Express, and TypeScript, and uses Prisma as an ORM for database interactions. It manages user data, securely stores encrypted passwords, and provides RESTful API endpoints for the frontend application.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup with Prisma](#database-setup-with-prisma)
- [API Documentation](#api-documentation)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The backend service handles user authentication, CRUD operations for password entries, and secure data storage. It communicates with a database via Prisma and is designed to work seamlessly with the frontend application (see [pwd-manager-frontend](https://github.com/AbdellahElh/pwd-manager-frontend)).

## Features

- **RESTful API:**  
  Provides endpoints for user registration, authentication, and password management (create, read, update, delete).

- **Secure Storage:**  
  Encrypts passwords and sensitive user data before storing them in the database.

- **Token-Based Authentication:**  
  Implements JWT to manage secure and stateless user sessions.

- **Database Integration via Prisma:**  
  Uses Prisma as an ORM to work with SQLite.

## Prerequisites

- **Node.js & npm:**  
  Ensure you have Node.js (LTS version recommended) and npm installed.

- **Database:**  
  A running instance of your chosen database (PostgreSQL, MySQL, etc.).  
  **Note:** Prisma uses `DATABASE_URL` in the `.env` file for the connection string.

## Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/AbdellahElh/pwd-manager-backend.git
    cd pwd-manager-backend
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Set Up Environment Variables:**  
   Create a `.env` file in the root directory with the following example configuration:

    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@localhost:5432/pwdmanager?schema=public"
    JWT_SECRET=your_jwt_secret_key
    ENCRYPTION_KEY=your_encryption_key
    ```

   > **Note:** Replace the `DATABASE_URL` with your actual database connection string. Ensure that your `.env` file is secured and not committed to version control.

## Database Setup with Prisma

1. **Generate the Prisma Client:**

    ```bash
    npx prisma generate
    ```

2. **Run Database Migrations:**

    ```bash
    npm run migrate
    ```

   These commands will set up the database schema as defined in the Prisma schema file located in the `prisma` folder.

## API Documentation

The backend exposes several endpoints. Below is a summary:

- **User Endpoints:**
  - `POST /api/users/register` – Register a new user.
  - `POST /api/users/login` – Authenticate an existing user and retrieve a token.

- **Credential Endpoints (Require Authentication):**
  - `GET /api/credentials` – Retrieve all stored credentials for the authenticated user.
  - `GET /api/credentials/:id` – Retrieve a stored credential for the authenticated user.
  - `POST /api/credentials` – Add a new credential.
  - `PUT /api/credentials/:id` – Update an existing credential entry.
  - `DELETE /api/credentials/:id` – Delete a credential entry.
    
For detailed API specifications, refer to the inline API documentation in the `routes` folder or generated documentation using your preferred tool.

## Security Considerations

- **Encryption:**  
  All passwords and sensitive data are encrypted before storage.

- **Authentication:**  
  The backend uses JWT for secure authentication. 

- **Environment Variables:**  
  Keep sensitive configuration details out of your source code by using environment variables.


## Testing

To run tests use:

    npm test

Ensure that your test environment is correctly configured to use a separate database or mock services to prevent data conflicts.

## Troubleshooting

- **Server Issues:**
  Verify that your environment variables are correctly set and that the database is running. Check the server logs for error messages.

- **Authentication Errors:**
  Confirm that your JWT secret is consistent across your application and that tokens are being generated and verified correctly.

- **API Not Responding:**
  Use tools like Postman or curl to test endpoints. Check network configurations and CORS settings if integrating with the frontend.

## Contributing

Contributions are welcome! If you wish to contribute:
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Submit a pull request with detailed explanations of your changes.
- Ensure that all code follows established linter.

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute as per the terms of the license.
