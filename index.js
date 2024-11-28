import express from "express";
import cors from "cors";
import session from "express-session";
import sequelize from "./db.js";

// Import routes
import routerTodo from "./src/routes/todo.routes.js";
import routerProjet from "./src/routes/projet.routes.js";
import routerUtilisateur from "./src/routes/utilisateur.routes.js";
import routerStatus from "./src/routes/status.routes.js";
import routerPermission from "./src/routes/permission.route.js";
import routerCollaboration from "./src/routes/collaboration.route.js";

const app = express();
const port = 3001;

// Middleware: CORS Configuration
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow cookies
}));
app.use(express.json());

// Session Middleware
app.use(session({
    secret: "b4c0n$3cur3_k3y#2024!@l0ngAndRand0mStr1ng",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
}));

// Routes
app.use("/todos", routerTodo);
app.use("/projets", routerProjet);
app.use("/utilisateurs", routerUtilisateur); // Login/Registration route
app.use("/status", routerStatus);
app.use("/permissions", routerPermission);
app.use("/collaborations", routerCollaboration);

// Start the server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

// Synchronize all models
sequelize.sync().then(() => {
    console.log("Database & tables created.");
});
