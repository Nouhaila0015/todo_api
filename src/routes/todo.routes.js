import express from "express";
import ToDo from "../models/ToDo.model.js";

// Initialiser le routeur
const routerTodo = express.Router();

// Routes
routerTodo.get("/", getAllToDos);
routerTodo.post("/", createToDo);

export default routerTodo;

// Fonction pour récupérer toutes les tâches
function getAllToDos(req, res) {
    ToDo.findAll()
        .then(todos => res.status(200).json(todos))
        .catch(error => res.status(500).json({ message: "Erreur lors de la récupération des tâches", error: error.message }));
}

// Fonction pour créer une nouvelle tâche
function createToDo(req, res) {
    const { titre, description, deadline, id_Status, user_id, projetId } = req.body;

    // Validation des données
    if (!titre || !description || !deadline || !id_Status || !user_id || !projetId) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    ToDo.create({ titre, description, deadline, id_Status, user_id, projetId })
        .then(newToDo => res.status(201).json(newToDo))
        .catch(error => res.status(500).json({ message: "Erreur lors de la création de la tâche", error: error.message }));
}
