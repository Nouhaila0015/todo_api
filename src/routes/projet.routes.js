import express from "express";
import Projet from "../models/Projet.model.js";
import Utilisateur from "../models/Utilisateur.model.js";

const routerProjet = express.Router();

// Middleware d'authentification
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

// CRUD pour Projet
routerProjet.get("/", checkAuth, async (req, res) => {
    try {
        const projets = await Projet.findAll({
            where: { created_by: req.session.user.id }
        });
        res.status(200).json(projets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Créer un projet
routerProjet.post("/", checkAuth, async (req, res) => {
    const { titre } = req.body;
    try {
        const newProjet = await Projet.create({
            titre,
            created_by: req.session.user.id
        });
        res.status(201).json(newProjet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer un projet
routerProjet.delete("/:id", checkAuth, async (req, res) => {
    try {
        const project = await Projet.findOne({
            where: {
                id_projet: req.params.id,
                created_by: req.session.user.id
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        await project.destroy();
        res.status(200).json({ message: "Projet supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour créer les projets par défaut pour un nouvel utilisateur
routerProjet.post("/create-defaults", checkAuth, async (req, res) => {
    try {
        const defaultProjects = [
            { titre: "Ma journée", created_by: req.session.user.id },
            { titre: "Important", created_by: req.session.user.id },
            { titre: "Deadline", created_by: req.session.user.id }
        ];

        const createdProjects = await Promise.all(
            defaultProjects.map(project => Projet.create(project))
        );

        res.status(201).json(createdProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default routerProjet;