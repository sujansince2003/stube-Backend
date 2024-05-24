# User Authentication System Documentation

## Overview

This document outlines the functionality and usage of the User Authentication System, which includes features for user registration, login, logout, and token management. The system leverages MongoDB for data storage, Mongoose for Object Data Modeling, and Cloudinary for file uploads. The authentication process involves generating access tokens and refresh tokens for secure session management.

## Prerequisites

- Node.js environment
- MongoDB database setup
- Cloudinary account configured for file uploads

## Installation

1. Clone the repository or download the project files.
2. Install dependencies by running `npm install`.
3. Set up environment variables for MongoDB URI, Cloudinary configuration, and any other external services.
4. Initialize the database schema using Mongoose models.

## Usage

### Register User

Endpoint: `/register`

Method: POST

Body Parameters:

- `username`: String, unique username for the user.
- `fullName`: String, full name of the user.
- `email`: String, email address of the user.
- `password`: String, password for the user account.
- `avatar`: File, image file for the user's avatar.
- `coverImage`: File, optional image file for the user's cover photo.

Success Response:

- Status Code: 201
- Content: `{ "message": "User registered successfully" }`

Failure Responses:

- Status Code: 400 Bad Request: Missing or invalid fields.
- Status Code: 409 Conflict: Username or email already exists.

### Login User

Endpoint: `/login`

Method: POST

Body Parameters:

- `username` or `email`: String, either the username or email of the user.
- `password`: String, password for the user account.

Success Response:

- Status Code: 200
- Content: `{ "message": "Login successful", "user": {... }, "refreshToken": "...", "accessToken": "..." }`
- Cookies: Sets `accessToken` and `refreshToken` cookies.

Failure Responses:

- Status Code: 400 Bad Request: Missing or invalid fields.
- Status Code: 401 Unauthorized: Incorrect password.
- Status Code: 404 Not Found: User not found.

### Logout User

Endpoint: `/logout`

Method: GET

No parameters required.

Success Response:

- Status Code: 200
- Content: `{ "message": "Logout successful" }`
- Clears `accessToken` and `refreshToken` cookies.

## Error Handling

The system implements robust error handling with custom error classes (`ApiError`) for various scenarios, including validation failures, database errors, and service-specific issues. Error messages are designed to be informative, aiding in debugging and user feedback.

## Security

- All communication is encrypted using HTTPS.
- Passwords are hashed before storage.
- Refresh tokens are invalidated upon logout.
- Access tokens are short-lived, requiring frequent refreshes via refresh tokens.

## Testing

Unit tests and integration tests are recommended to ensure the reliability and correctness of the authentication system. Focus on testing edge cases, error handling, and interaction with external services like Cloudinary.

## Contributing

Contributions to improve the system's functionality, security, and usability are welcome. Please submit pull requests with clear descriptions of the changes.

---

This documentation serves as a guide for developers integrating with or maintaining the User Authentication System. It covers the basic usage, installation, and security considerations. For more detailed implementation specifics, refer to the source code comments and the development team.
