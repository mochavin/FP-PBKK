# Backend

## Project Structure
```
backend/
├── config/            # Database configuration
├── controllers/       # Handlers for API endpoints
├── middlewares/       # JWT authentication middleware
├── migrations/        # Database migration files
├── models/            # Database models
├── routes/            # API route definitions
├── .env               # Environment variables
├── go.mod             # Go modules file
└── main.go            # Application entry point
```

## Endpoints

### **Auth**
- **POST** `/auth/login`  
  Login with email and password.
  ```
  POST http://localhost:8080/auth/login

  Payload:
  {
      "email": "john@example.com",
      "password": "securepassword123"
  }
  ```
- **POST** `/auth/register`  
  Register with email and password.
  ```
  POST http://localhost:8080/auth/register

  Payload:
  {
      "username": "john_doe",
      "email": "john@example.com",
      "password": "securepassword123"
  }
  ```

### **Boards**
- **POST** `/board`  
  Create a new board.  
  ```
  POST http://localhost:8080/board

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "name": "Project Alpha"
  }
  ```
- **GET** `/board`  
  Get all boards.  
  ```
  GET http://localhost:8080/board

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **GET** `/board/:boardId`  
  Get details of a single board.  
  ```
  GET http://localhost:8080/board/:boardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **PUT** `/board/:boardId`  
  Update a board.  
  ```
  PUT http://localhost:8080/board/:boardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "name": "Project Beta"
  }
  ```
- **DELETE** `/board/:boardId`  
  Delete a board.  
  ```
  DELETE http://localhost:8080/board/:boardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **GET** `/board/:boardId/full`  
  Get a board with its lists and cards.  
  ```
  GET http://localhost:8080/board/:boardId/full

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```

### **Lists**
- **POST** `/board/:boardId/lists`  
  Create a new list under a board.  
  ```
  POST http://localhost:8080/board/:boardId/lists

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "name": "To Do",
      "position": 1
  }
  ```
- **GET** `/board/:boardId/lists`  
  Get all lists for a specific board.  
  ```
  GET http://localhost:8080/board/:boardId/lists

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **GET** `/board/:boardId/lists/:listId`  
  Get details of a single list.  
  ```
  GET http://localhost:8080/board/:boardId/lists/:listId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **PUT** `/board/:boardId/lists/:listId`  
  Update a list.  
  ```
  PUT http://localhost:8080/board/:boardId/lists/:listId

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "name": "In Progress",
      "position": 2
  }
  ```
- **DELETE** `/board/:boardId/lists/:listId`  
  Delete a list.  
  ```
  DELETE http://localhost:8080/board/:boardId/lists/:listId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```

### **Cards**
- **POST** `/board/:boardId/lists/:listId/cards`  
  Create a new card under a list.  
  ```
  POST http://localhost:8080/board/:boardId/lists/:listId/cards

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "title": "Implement Login",
      "description": "Create login functionality with JWT",
      "position": 1
  }
  ```
- **GET** `/board/:boardId/lists/:listId/cards`  
  Get all cards for a specific list.  
  ```
  GET http://localhost:8080/board/:boardId/lists/:listId/cards

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **GET** `/board/:boardId/lists/:listId/cards/:cardId`  
  Get details of a single card.  
  ```
  GET http://localhost:8080/board/:boardId/lists/:listId/cards/:cardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```
- **PUT** `/board/:boardId/lists/:listId/cards/:cardId`  
  Update a card.  
  ```
  PUT http://localhost:8080/board/:boardId/lists/:listId/cards/:cardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...

  Payload:
  {
      "title": "Implement OAuth Login",
      "description": "Update login to support OAuth providers",
      "position": 2
  }
  ```
- **DELETE** `/board/:boardId/lists/:listId/cards/:cardId`  
  Delete a card.  
  ```
  DELETE http://localhost:8080/board/:boardId/lists/:listId/cards/:cardId

  Header:
  Authorization: Bearer eyJhbGciOiJ...
  ```

## Authentication
Protected routes require a valid JWT token. Use the `/auth/login` endpoint to retrieve a token and include it in the `Authorization` header as `Bearer <token>`.

