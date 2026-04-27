// Import express
import express from "express";

// Create an express app
const app = express();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

app.use(express.json());

/* // Routers
import usersRouter from "./routes/users.routes.js";
import habitsRouter from "./routes/habits.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import userTasksRouter from "./routes/userTasks.routes.js";
import impactsRouter from "./routes/impacts.routes.js";

// Mount routers
app.use("/users", usersRouter);
app.use("/habits", habitsRouter);
app.use("/tasks", tasksRouter);
// userTasks routes are nested under /users (they start with :userId/...)
app.use("/users", userTasksRouter);
app.use("/impacts", impactsRouter); */

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
