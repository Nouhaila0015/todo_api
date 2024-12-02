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
        const { titre, description, deadline, id_Status, projetId, isToday } = req.body;

        // Create the main task
        const todo = await ToDo.create({
            titre,
            description,
            deadline,
            id_Status,
            user_id: req.session.user.id,
            projetId,
            isToday: isToday || false,
        });

        // Find the "Deadline" and "Ma journée" projects
        const projects = await Projet.findAll({ where: { created_by: req.session.user.id } });
        const deadlineProject = projects.find(p => p.titre === "Deadline");
        const maJourneeProject = projects.find(p => p.titre === "Ma journée");

        if (!deadlineProject || !maJourneeProject) {
            return res.status(500).json({ message: "Projets 'Deadline' ou 'Ma journée' introuvables." });
        }

        const today = new Date();
        const taskDate = new Date(deadline);

        if (taskDate.toDateString() === today.toDateString()) {
            // Add a copy to "Ma journée"
            await ToDo.create({
                titre,
                description,
                deadline,
                id_Status,
                user_id: req.session.user.id,
                projetId: maJourneeProject.id_projet,
                isToday: true,
            });
        } else {
            // Add a copy to "Deadline"
            await ToDo.create({
                titre: ` ${titre}`,
                description,
                deadline,
                id_Status,
                user_id: req.session.user.id,
                projetId: deadlineProject.id_projet,
                isToday: false,
            });
        }

        res.status(201).json(todo);
    } catch (error) {
        console.error('Error adding task:', error);
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
            }
        });

        if (!todo) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        // Trouver le projet "Important"
        const importantProject = await Projet.findOne({
            where: { 
                titre: "Important",
                created_by: req.session.user.id
            }
        });

        if (!importantProject) {
            return res.status(404).json({ message: "Projet Important non trouvé" });
        }

        // Vérifier si la tâche existe déjà dans le projet "Important"
        const existingImportantTask = await ToDo.findOne({
            where: {
                titre: todo.titre,
                user_id: req.session.user.id,
                projetId: importantProject.id_projet
            }
        });

        if (!todo.isImportant) {
            // Si la tâche n'est pas encore marquée comme importante et n'existe pas déjà dans "Important"
            if (!existingImportantTask) {
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
            }
        } else {
            // Si la tâche est déjà importante, supprimer sa copie dans le projet "Important"
            if (existingImportantTask) {
                await existingImportantTask.destroy();
            }
        }

        // Mettre à jour l'état `isImportant` de la tâche originale
        await todo.update({ isImportant: !todo.isImportant });

        // Retourner la tâche mise à jour
        res.json(todo);
    } catch (error) {
        console.error('Error updating importance:', error);
        res.status(500).json({ message: error.message });
    }
});


// Vérifier et ajouter une tâche au projet "Deadline"

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