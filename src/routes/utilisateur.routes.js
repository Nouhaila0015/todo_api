import express from "express";
import Utilisateur from "../models/Utilisateur.model.js";
import Projet from "../models/Projet.model.js";
import bcrypt from "bcrypt";

const app = express();

const routerUtilisateur = express.Router();

routerUtilisateur.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
          return res.status(400).json({ error: "Email already exists." });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUtilisateur = await Utilisateur.create({
          username,
          email,
          password: hashedPassword,
      });

      // Créer une session pour le nouvel utilisateur
      req.session.user = {
          id: newUtilisateur.id_user,
          username: newUtilisateur.username,
          email: newUtilisateur.email,
      };

      // Créer les projets par défaut
      const defaultProjects = [
          { titre: "Ma journée", created_by: newUtilisateur.id_user },
          { titre: "Important", created_by: newUtilisateur.id_user },
          { titre: "Deadline", created_by: newUtilisateur.id_user }
      ];

      await Promise.all(defaultProjects.map(project => Projet.create(project)));

      res.status(201).json({
          message: "User registered successfully.",
          user: {
              id: newUtilisateur.id_user,
              username: newUtilisateur.username,
              email: newUtilisateur.email,
          },
      });
  } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// **2. Login User**
routerUtilisateur.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Save session details
    req.session.user = {
      id: user.id_user,
      username: user.username,
      email: user.email,
    };

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id_user,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});


// **3. Logout**
routerUtilisateur.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logout successful" });
});

// **4. Verify Session**
routerUtilisateur.get("/verify-session", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// **5. DELETE utilisateur**
routerUtilisateur.delete("/:id", async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ error: "Utilisateur not found" });
        }
        await utilisateur.destroy();
        res.status(200).json({ message: "Utilisateur deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **1. GET all utilisateurs**
routerUtilisateur.get("/", async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.findAll();
        res.status(200).json(utilisateurs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **2. GET utilisateur by ID**
routerUtilisateur.get("/:id", async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ error: "Utilisateur not found" });
        }
        res.status(200).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **3. POST create utilisateur**
routerUtilisateur.post("/", async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUtilisateur = await Utilisateur.create({ username, password });
        res.status(201).json(newUtilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **4. PUT update utilisateur**
routerUtilisateur.put("/:id", async (req, res) => {
    const { username, password } = req.body;
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ error: "Utilisateur not found" });
        }
        utilisateur.username = username || utilisateur.username;
        utilisateur.password = password || utilisateur.password;
        await utilisateur.save();
        res.status(200).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default routerUtilisateur;