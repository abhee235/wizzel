export const SOCKET_SERVER_URL: string = 'http://localhost:3001';

export const SOCKET_OPTIONS: any = {
  reconnectionAttempts: 5, // Limit the number of reconnection attempts
  transports: ['websocket'], // Use WebSocket transport
  secure: true, // Use SSL if your server is hosted securely
  withCredentials: true, // Allow cross-origin credentials
  // cors: {
  //   origin: "http://localhost:3000", // Your client URL
  //   methods: ["GET", "POST"], // Allowed methods
  //   allowedHeaders: ["my-custom-header"], // If you need custom headers
  //   credentials: true, // If you need to allow credentials (cookies, etc.)
  // },
};