# Trello Clone

A full-stack Trello clone built with Next.js and Go, featuring real-time collaboration and a modern UI.

![image](https://github.com/user-attachments/assets/d0bdaa86-5b44-4dbf-be0a-fd53c450bcf6)

[Watch Demo Video](https://youtu.be/GuPkAMnygio)

## Features

- 🔐 Authentication with JWT
- 📋 Create and manage boards
- 📝 Create, edit and delete lists
- 🎯 Add and manage cards within lists
- 🎨 Modern and responsive UI with Tailwind CSS
- 🔄 Real-time updates
- 🚀 Fast and efficient API with Go

## Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Radix UI
- Shadcn UI Components

### Backend
- Go
- Gin Web Framework
- GORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Running the Backend
```bash
cd backend
go mod download
go run main.go
```
Backend API will be available at `http://localhost:8080`
