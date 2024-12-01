import express from 'express';
import ToDo from '../models/ToDo.model.js';
import Projet from '../models/Projet.model.js';
import Sequelize from 'sequelize';

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

router.use(checkAuth);

// Obtenir toutes les tâches pour aujourd'hui
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayTodos = await ToDo.findAll({
            where: {
                user_id: req.session.user.id,
                isToday: true,
                deadline: { [Sequelize.Op.between]: [today, tomorrow] }
            },
            include: [{ model: Projet }]
        });
        res.json(todayTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les tâches d'un projet spécifique
router.get('/projet/:projetId', async (req, res) => {
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

// Obtenir toutes les tâches importantes
router.get('/important', async (req, res) => {
    try {
        const importantProject = await Projet.findOne({
            where: { 
                titre: "Important",
                created_by: req.session.user.id
            }
        });
        
        if (!importantProject) {
            return res.status(404).json({ message: "Projet Important non trouvé" });
        }

        const importantTodos = await ToDo.findAll({
            where: { 
                user_id: req.session.user.id,
                projetId: importantProject.id_projet
            },
            include: [{ model: Projet }]
        });
        res.json(importantTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer une tâche
router.post('/', async (req, res) => {
    try {
        const { titre, description, deadline, id_Status, projetId, isToday, isImportant } = req.body;

        // Créer la tâche principale
        const todo = await ToDo.create({
            titre,
            description,
            deadline,
            id_Status,
            user_id: req.session.user.id,
            projetId,
            isToday: isToday || false,
            isImportant: isImportant || false
        });

        // Si la tâche est importante, créer une copie dans le projet Important
        if (isImportant) {
            const importantProject = await Projet.findOne({
                where: { 
                    titre: "Important",
                    created_by: req.session.user.id
                }
            });
            if (importantProject) {
                await ToDo.create({
                    titre,
                    description,
                    deadline,
                    id_Status,
                    user_id: req.session.user.id,
                    projetId: importantProject.id_projet,
                    isToday,
                    isImportant: true
                });
            }
        }

        // Si la date est aujourd'hui, créer une copie dans "Ma journée"
        const today = new Date();
        const taskDate = new Date(deadline);
        if (taskDate.toDateString() === today.toDateString()) {
            const maJourneeProject = await Projet.findOne({
                where: { 
                    titre: "Ma journée",
                    created_by: req.session.user.id
                }
            });
            if (maJourneeProject) {
                await ToDo.create({
                    titre,
                    description,
                    deadline,
                    id_Status,
                    user_id: req.session.user.id,
                    projetId: maJourneeProject.id_projet,
                    isToday: true,
                    isImportant: isImportant || false
                });
            }
        }

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Marquer une tâche comme importante
router.put('/:id/important', async (req, res) => {
    try {
        // Trouver la tâche originale
        const todo = await ToDo.findOne({
            where: { 
                id_Tache: req.params.id,
                user_id: req.session.user.id 
            },
            include: [{ model: Projet }]
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        // Trouver le projet Important
        const importantProject = await Projet.findOne({
            where: { 
                titre: "Important",
                created_by: req.session.user.id
            }
        });
        if (!importantProject) return res.status(404).json({ message: "Projet Important non trouvé" });

        if (!todo.isImportant) {
            // Créer une copie dans le projet Important
            await ToDo.create({
                titre: todo.titre,
                description: todo.description,
                deadline: todo.deadline,
                id_Status: todo.id_Status,
                user_id: req.session.user.id,
                projetId: importantProject.id_projet,
                isToday: todo.isToday,
                isImportant: true
            });
        } else {
            // Supprimer la copie du projet Important
            await ToDo.destroy({
                where: {
                    titre: todo.titre,
                    user_id: req.session.user.id,
                    projetId: importantProject.id_projet
                }
            });
        }

        // Mettre à jour l'état de la tâche originale
        await todo.update({ isImportant: !todo.isImportant });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Modifier une tâche
router.put('/:id', async (req, res) => {
    try {
        const { titre, description, deadline, id_Status, isToday } = req.body;
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
            id_Status,
            isToday: isToday || false
        });

        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
    try {
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });
        
        // Si la tâche est importante, supprimer aussi la copie du projet Important
        if (todo.isImportant) {
            const importantProject = await Projet.findOne({
                where: { 
                    titre: "Important",
                    created_by: req.session.user.id
                }
            });
            if (importantProject) {
                await ToDo.destroy({
                    where: {
                        titre: todo.titre,
                        user_id: req.session.user.id,
                        projetId: importantProject.id_projet
                    }
                });
            }
        }

        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une tâche spécifique
router.get('/:id', async (req, res) => {
    try {
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            },
            include: [{ model: Projet }]
        });
        if (!todo) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;