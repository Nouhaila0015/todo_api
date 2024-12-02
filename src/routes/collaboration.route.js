import express from 'express';
import Collaboration from '../models/Collaboration.model.js'; 
import Utilisateur from '../models/Utilisateur.model.js';
import Projet from '../models/Projet.model.js';
import Permission from '../models/Permission.model.js';

const routerCollaboration = express.Router();

// Middleware d'authentification
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

// Appliquer le middleware à toutes les routes
routerCollaboration.use(checkAuth);

// Inviter un utilisateur par email
routerCollaboration.post('/invite', async (req, res) => {
    const { email, projectId, permission } = req.body;

    try {
        // Vérifier si l'utilisateur invité existe
        const invitedUser = await Utilisateur.findOne({ where: { email } });
        if (!invitedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si l'utilisateur est déjà membre du projet
        const existingCollaboration = await Collaboration.findOne({
            where: {
                id_membre: invitedUser.id_user,
                id_projet: projectId
            }
        });

        if (existingCollaboration) {
            return res.status(400).json({ message: "L'utilisateur est déjà membre de ce projet" });
        }

        // Trouver la permission
        const permissionRecord = await Permission.findOne({
            where: { desc: permission }
        });

        if (!permissionRecord) {
            return res.status(404).json({ message: "Permission invalide" });
        }

        // Créer la collaboration
        const collaboration = await Collaboration.create({
            id_membre: invitedUser.id_user,
            id_projet: projectId,
            id_permission: permissionRecord.id_permission
        });

        res.status(201).json({
            message: "Invitation envoyée avec succès",
            collaboration
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'invitation", error: error.message });
    }
});

// Obtenir tous les membres d'un projet
routerCollaboration.get('/projet/:projectId/members', async (req, res) => {
    try {
        const collaborations = await Collaboration.findAll({
            where: { id_projet: req.params.projectId },
            include: [
                { 
                    model: Utilisateur,
                    attributes: ['id_user', 'username', 'email']
                },
                {
                    model: Permission,
                    attributes: ['desc']
                }
            ]
        });
        res.json(collaborations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des membres", error: error.message });
    }
});

// Modifier le rôle d'un membre
routerCollaboration.put('/:collaborationId/permission', async (req, res) => {
    const { permission } = req.body;
    try {
        const permissionRecord = await Permission.findOne({
            where: { desc: permission }
        });

        if (!permissionRecord) {
            return res.status(404).json({ message: "Permission invalide" });
        }

        const collaboration = await Collaboration.findByPk(req.params.collaborationId);
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration non trouvée" });
        }

        await collaboration.update({ id_permission: permissionRecord.id_permission });
        res.json(collaboration);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification du rôle", error: error.message });
    }
});

// Retirer un membre du projet
routerCollaboration.delete('/:collaborationId', async (req, res) => {
    try {
        const collaboration = await Collaboration.findByPk(req.params.collaborationId);
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration non trouvée" });
        }

        await collaboration.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du retrait du membre", error: error.message });
    }
});

export default routerCollaboration;