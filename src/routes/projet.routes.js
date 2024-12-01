import express from "express";
import Projet from "../models/Projet.model.js";

const routerProjet = express.Router();

// CRUD pour Projet
routerProjet.get("/", async (req, res) => {
    try {
        const projets = await Projet.findAll();
        res.status(200).json(projets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

routerProjet.post("/", async (req, res) => {
    const { titre, created_by } = req.body;
    try {
        const newProjet = await Projet.create({ titre, created_by });
        res.status(201).json(newProjet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
routerProjet.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Projet.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        await project.destroy();
        res.status(200).json({ message: "Projet supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default routerProjet;