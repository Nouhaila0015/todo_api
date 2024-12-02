import express from "express";
import cors from "cors";
import session from "express-session";
import sequelize from "./db.js";
import { createServer } from "http"; // Import for creating HTTP server
import { Server } from "socket.io";

// Import routes
import routerTodo from "./src/routes/todo.routes.js";
import routerProjet from "./src/routes/projet.routes.js";
import routerUtilisateur from "./src/routes/utilisateur.routes.js";
import routerStatus from "./src/routes/status.routes.js";
import routerPermission from "./src/routes/permission.route.js";
import routerCollaboration from "./src/routes/collaboration.route.js";
import notificationRoutes from "./src/routes/Notification.route.js";

const app = express();
const port = 3001;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allowed origin
    credentials: true, // Allow cookies and credentials
  },
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // When a user joins a project
  socket.on("joinProject", (projectId) => {
    console.log(`User joined project: ${projectId}`);
    socket.join(`project_${projectId}`);
  });

  // When a task is updated
  socket.on("taskUpdated", (data) => {
    console.log(`Task updated for project: ${data.projectId}`);
    socket.to(`project_${data.projectId}`).emit("taskUpdate", data);
  });

  // When the user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Middleware: CORS Configuration
const allowedOrigins = ["http://localhost:3000", "http://localhost:3002"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
);
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: "b4c0n$3cur3_k3y#2024!@l0ngAndRand0mStr1ng",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Routes
app.use("/todos", routerTodo);
app.use("/projets", routerProjet);
app.use("/utilisateurs", routerUtilisateur); // Login/Registration route
app.use("/status", routerStatus);
app.use("/permissions", routerPermission);
app.use("/collaborations", routerCollaboration);
app.use("/notifications", notificationRoutes);

// Start the server with Socket.IO
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

// Synchronize all models
sequelize.sync().then(() => {
  console.log("Database & tables created.");
});
