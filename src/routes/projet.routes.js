import express from 'express';
import Projet from '../models/Projet.model.js';

const routerProjet = express.Router();

// Middleware d'authentification
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

// Créer un projet
routerProjet.post('/', checkAuth, async (req, res) => {
    try {
        const { titre } = req.body;
        const projet = await Projet.create({
            titre,
            created_by: req.session.user.id
        });
        res.status(201).json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les projets de l'utilisateur
routerProjet.get('/', checkAuth, async (req, res) => {
    try {
        const projets = await Projet.findAll({
            where: { created_by: req.session.user.id },
            order: [['created_at', 'DESC']]
        });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un projet spécifique
routerProjet.get('/:id', checkAuth, async (req, res) => {
    try {
        const projet = await Projet.findOne({
            where: {
                id_projet: req.params.id,
                created_by: req.session.user.id
            }
        });
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Modifier un projet
routerProjet.put('/:id', checkAuth, async (req, res) => {
    try {
        const { titre } = req.body;
        const projet = await Projet.findOne({
            where: {
                id_projet: req.params.id,
                created_by: req.session.user.id
            }
        });
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        await projet.update({ titre });
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un projet
routerProjet.delete('/:id', checkAuth, async (req, res) => {
    try {
        const projet = await Projet.findOne({
            where: {
                id_projet: req.params.id,
                created_by: req.session.user.id
            }
        });
        if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
        await projet.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default routerProjet;