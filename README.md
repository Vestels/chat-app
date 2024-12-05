# Real-Time Chat Application
## Prerequisites
- Node.js >= 14
- MongoDB
- npm / yarn

## STACK
- Frontend: React, Material-UI, Socket.IO Client
- Backend: Node.js, Express.js, Socket.IO
- Database: MongoDB
- Authentication: JWT

## Features
- User authentication (login/register)
- Private messaging between users
- Real-time message delivery with Socket.IO
- Unread message notifications

# Starting The Application

## Backend
```javascript
cd chat-backend
npm install
npm start
```
## Frontend
```javascript
cd chat-client
npm install
npm start
```
## Environment Variables (.env(included))
```javascript
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=4000
```
# API Endpoints
## Auth
- **POST:** /api/auth/register ---> User registration
- **POST:** /api/auth/login ---> User login
## Users
- **GET:** /api/users ---> Get users
## Messages
- **POST:** /api/messages ---> Send message
- **GET:** /api/messages/:roomId ---> Get messages for a privated chat room
## Rooms (Chat Rooms)
- **POST:** /api/rooms ---> Create private chat room
- **GET:** /api/rooms ---> Get private chat rooms
- **GET:** /api/rooms/:roomId ---> Get a specific private chat room
- **PUT:** /api/rooms/:roomId ---> Update a specific private chat room