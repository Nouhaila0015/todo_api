import express from 'express';
import ToDo from '../models/ToDo.model.js';
import Projet from '../models/Projet.model.js';
import Sequelize from 'sequelize';

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
        const { titre, description, deadline, id_Status, projetId, isToday, isImportant, reminder, repeat } = req.body;

        const todo = await ToDo.create({
            titre,
            description,
            deadline,
            id_Status,
            user_id: req.session.user.id, // Authenticated user
            projetId,
            isToday: isToday || false, // Default false if not provided
            isImportant: isImportant || false, // Default false if not provided
            reminder: reminder || null, // Null if not provided
            repeat: repeat || null,
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
        const { titre, description, deadline, id_Status, isToday, isImportant, reminder, repeat } = req.body;

        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id,
            },
        });

        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        await todo.update({
            titre,
            description,
            deadline,
            id_Status,
            isToday: isToday || false, // Default false if not provided
            isImportant: isImportant || false, // Default false if not provided
            reminder: reminder || null, // Null if not provided
            repeat: repeat || null,
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
router.put('/:id/today', checkAuth, async (req, res) => {
    try {
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        await todo.update({ isToday: true });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/reminder', checkAuth, async (req, res) => {
    try {
        const { reminder } = req.body;

        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        await todo.update({ reminder });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/repeat', checkAuth, async (req, res) => {
    try {
        const { repeat } = req.body;

        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id
            }
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        await todo.update({ repeat });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/important/:id', checkAuth, async (req, res) => {
    try {
        const importantTodos = await ToDo.findAll({
            where: { user_id: req.session.user.id, isImportant: true, id_Tache: req.params.id },
        });
        if (importantTodos.length === 0) return res.status(404).json({ message: "Aucune tâche trouvée" });
        res.json(importantTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les tâches planifiées

router.get('/planned/:id', checkAuth, async (req, res) => {
    try {
        const plannedTodos = await ToDo.findAll({
            where: { user_id: req.session.user.id },
            include: [{ model: Projet, where: { titre: "Planifié" } }],
        });
        if (!plannedTodos.length) return res.status(404).json({ message: "Aucune tâche planifiée trouvée" });
        res.json(plannedTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Obtenir toutes les tâches pour aujourd'hui
router.get('/today/:id', checkAuth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayTodos = await ToDo.findAll({
            where: {
                user_id: req.session.user.id,
                isToday: true,
                id_Tache: req.params.id,
                deadline: { [Sequelize.Op.between]: [today, tomorrow] },
            }
        });
        if (todayTodos.length === 0) return res.status(404).json({ message: "Aucune tâche trouvée" });
        res.json(todayTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id/important', checkAuth, async (req, res) => {
    try {
      const todo = await ToDo.findOne({
        where: { 
          id_Tache: req.params.id,
          user_id: req.session.user.id 
        },
      });
      if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });
  
      await todo.update({ isImportant: true });
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// Planifier une tâche
router.put('/:id/plan', checkAuth, async (req, res) => {
    try {
        const { deadline } = req.body;

        // Check if "Planifié" project exists, create if it doesn't
        let projetPlanifie = await Projet.findOne({
            where: { titre: "Planifié", created_by: req.session.user.id },
        });
        if (!projetPlanifie) {
            projetPlanifie = await Projet.create({
                titre: "Planifié",
                created_by: req.session.user.id,
            });
        }

        // Find the task and update it
        const todo = await ToDo.findOne({
            where: {
                id_Tache: req.params.id,
                user_id: req.session.user.id,
            },
        });
        if (!todo) return res.status(404).json({ message: "Tâche non trouvée" });

        await todo.update({
            deadline,
            projetId: projetPlanifie.id_projet, // Associate with "Planned" project
        });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;