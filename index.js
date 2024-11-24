import express from "express";
import cors from "cors";
import sequelize from "./db.js";

// Import des routes
import routerTodo from "./src/routes/todo.routes.js";
import routerProjet from "./src/routes/projet.routes.js";
import routerUtilisateur from "./src/routes/utilisateur.routes.js";
import routerStatus from "./src/routes/status.routes.js";
import routerPermission from "./src/routes/permission.route.js";
import routerCollaboration from "./src/routes/collaboration.route.js";

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/todos", routerTodo);
app.use("/projets", routerProjet);
app.use("/utilisateurs", routerUtilisateur);
app.use("/status", routerStatus);
app.use("/permissions", routerPermission);
app.use("/collaborations", routerCollaboration);

// Launch the server
app.listen(port, () => {
    console.log(`Server Started at ${port}`)
});

// Synchronize all models
sequelize.sync().then(() => {
    console.log('Database & tables created.');
});