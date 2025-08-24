# Code Sharing Platform

A modern code sharing platform built with React and Node.js that allows users to share code snippets with expiration times and syntax highlighting.

## Features

- Share code snippets with custom expiration times
- Syntax highlighting for multiple programming languages
- Multiple snippets per user
- Admin panel for monitoring
- Copy to clipboard functionality
- Clean and modern UI

## Setup

### Frontend

1. Install dependencies:

```bash
cd client
npm install
```

2. Start development server:

```bash
npm start
```

### Backend

1. Install dependencies:

```bash
cd server
npm install
```

2. Start server:

```bash
node server.js
```

## Environment Variables

Create a `.env` file in the root of the frontend project with:

```
REACT_APP_API_URL=your_backend_url
```

## Technologies Used

- React
- Node.js
- Express
- react-syntax-highlighter
