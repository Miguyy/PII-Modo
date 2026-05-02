// Import express
import express from "express";

// Create an express app
const app = express();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

app.use(express.json());

// Routers
import usersRouter from "./routes/users.routes.js";
import habitsRouter from "./routes/habits.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import userTasksRouter from "./routes/userTasks.routes.js";
import impactsRouter from "./routes/impacts.routes.js";
import locationsRouter from "./routes/locations.routes.js";
import decorationsRouter from "./routes/decorations.routes.js";
import userDecorationsRouter from "./routes/userDecorations.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import reportsRouter from "./routes/reports.routes.js";

// Routes
app.use("/users", usersRouter);
app.use("/habits", habitsRouter);
app.use("/tasks", tasksRouter);
app.use("/users", userTasksRouter);
app.use("/impacts", impactsRouter);
app.use("/users", locationsRouter);
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

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
