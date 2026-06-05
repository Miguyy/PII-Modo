// Import express
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create an express app
const app = express();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Or match your express CORS configuration
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

app.use(express.json());
// Enable CORS for the frontend during development. Set FRONTEND_URL
// in env to restrict in other environments.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(o => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      }

      // Default development behavior: allow any localhost port
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());
// Answer preflight requests for all routes

// Routers
import usersRouter from "./routes/users.routes.js";
import habitsRouter from "./routes/habits.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import userTasksRouter from "./routes/userTasks.routes.js";
import impactsRouter from "./routes/impacts.routes.js";
import decorationsRouter from "./routes/decorations.routes.js";
import userDecorationsRouter from "./routes/userDecorations.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import locationsRouter from "./routes/locations.routes.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "./middlewares/users.middlewares.js";
import { getAllLocations } from "./controllers/locations.controllers.js";
import { setupAuthSockets } from "./sockets/auth.sockets.js";

// Initialize socket handlers
setupAuthSockets(io);

// Routes
app.use("/users", usersRouter);
app.use("/habits", habitsRouter);
app.use("/tasks", tasksRouter);
app.use("/users", userTasksRouter);
app.use("/impacts", impactsRouter);
app.use("/users/:userId/location", locationsRouter);
// Global locations listing (admin)
app.get("/locations", authenticateUser, authorizeAdmin, getAllLocations);
app.use("/avatar-decorations", decorationsRouter);
app.use("/users", userDecorationsRouter);
app.use("/", notificationsRouter);
app.use("/", reportsRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    description: err.message || "Internal server error",
    ...(err.errors && { errors: err.errors }), // include validation errors if present
  });
});

httpServer.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
