import express from 'express';
import ToDo from '../models/ToDo.model.js';
import Projet from '../models/Projet.model.js';

const router = express.Router();

// Middleware d'authentification
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

// Créer une tâche
router.post('/', checkAuth, async (req, res) => {
    try {
        const { titre, description, deadline, id_Status, projetId } = req.body;
        const todo = await ToDo.create({
            titre,
            description,
            deadline,
            id_Status,
            user_id: req.session.user.id,
            projetId
        });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les tâches de l'utilisateur
router.get('/', checkAuth, async (req, res) => {
    try {
        const todos = await ToDo.findAll({
            where: { user_id: req.session.user.id },
            include: [{ model: Projet }],
            order: [['deadline', 'ASC']]
        });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les tâches d'un projet spécifique
router.get('/projet/:projetId', checkAuth, async (req, res) => {
    try {
        const todos = await ToDo.findAll({
            where: { 
                user_id: req.session.user.id,
                projetId: req.params.projetId
            },
            include: [{ model: Projet }]
        });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Modifier une tâche
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const { titre, description, deadline, id_Status } = req.body;
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });
        
        await todo.update({
            titre,
            description,
            deadline,
            id_Status
        });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une tâche
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });
        
        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;