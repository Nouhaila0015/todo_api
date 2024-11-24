import express from "express";
import Utilisateur from "../models/Utilisateur.model.js";

const routerUtilisateur = express.Router();

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

export default routerUtilisateur;