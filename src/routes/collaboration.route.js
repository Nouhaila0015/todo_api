import express from 'express';
import Collaboration from '../models/Collaboration.model.js'; 
import Utilisateur from '../models/Utilisateur.model.js';
import Projet from '../models/Projet.model.js';
import Permission from '../models/Permission.model.js';

const routerCollaboration = express.Router();

// Route pour récupérer toutes les collaborations
routerCollaboration.get('/collaborations', async (req, res) => {
    try {
        const collaborations = await Collaboration.findAll({
            include: [
                { model: Utilisateur, attributes: ['id', 'nom', 'prenom'] }, // Inclut les informations de l'utilisateur
                { model: Projet, attributes: ['id', 'nom'] }, // Inclut les informations du projet
                { model: Permission, attributes: ['id', 'desc'] } // Inclut les informations de la permission
            ]
        });
        res.json(collaborations);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des collaborations', error });
    }
});

// Route pour créer une nouvelle collaboration
routerCollaboration.post('/collaborations', async (req, res) => {
    const { id_membre, id_projet, id_permission } = req.body;

    if (!id_membre || !id_projet || !id_permission) {
        return res.status(400).json({ message: 'Les champs id_membre, id_projet et id_permission sont requis.' });
    }

    try {
        const collaboration = await Collaboration.create({ id_membre, id_projet, id_permission });
        res.status(201).json(collaboration);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la collaboration', error });
    }
});

// Route pour récupérer une collaboration spécifique par son ID
routerCollaboration.get('/collaborations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const collaboration = await Collaboration.findByPk(id, {
            include: [
                { model: Utilisateur, attributes: ['id', 'nom', 'prenom'] },
                { model: Projet, attributes: ['id', 'nom'] },
                { model: Permission, attributes: ['id', 'desc'] }
            ]
        });
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration non trouvée' });
        }
        res.json(collaboration);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la collaboration', error });
    }
});

// Route pour mettre à jour une collaboration
routerCollaboration.put('/collaborations/:id', async (req, res) => {
    const { id } = req.params;
    const { id_membre, id_projet, id_permission } = req.body;

    if (!id_membre || !id_projet || !id_permission) {
        return res.status(400).json({ message: 'Les champs id_membre, id_projet et id_permission sont requis.' });
    }

    try {
        const collaboration = await Collaboration.findByPk(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration non trouvée' });
        }

        collaboration.id_membre = id_membre;
        collaboration.id_projet = id_projet;
        collaboration.id_permission = id_permission;

        await collaboration.save();
        res.json(collaboration);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la collaboration', error });
    }
});

// Route pour supprimer une collaboration
routerCollaboration.delete('/collaborations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const collaboration = await Collaboration.findByPk(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration non trouvée' });
        }

        await collaboration.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la collaboration', error });
    }
});

export default routerCollaboration;
