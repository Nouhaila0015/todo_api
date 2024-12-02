import express from 'express';
import Notification from '../models/Notification.model.js';
import Utilisateur from '../models/Utilisateur.model.js';
import Projet from '../models/Projet.model.js';

const notificationRoutes = express.Router();

// Middleware d'authentification
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Non authentifié" });
    }
    next();
};

// Appliquer le middleware d'authentification à toutes les routes
notificationRoutes.use(checkAuth);

// Obtenir toutes les notifications de l'utilisateur
notificationRoutes.get('/', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.session.user.id },
            include: [
                { 
                    model: Utilisateur,
                    as: 'sender',
                    attributes: ['username', 'email']
                },
                {
                    model: Projet,
                    attributes: ['titre']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Créer une nouvelle notification
notificationRoutes.post('/', checkAuth, async (req, res) => {
    try {
        const { user_email, message, type, projectId } = req.body;
        
        // Trouver l'utilisateur invité
        const invitedUser = await Utilisateur.findOne({ where: { email: user_email } });
        if (!invitedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Créer la notification
        const notification = await Notification.create({
            user_id: invitedUser.id_user,
            message,
            type,
            projet_id: projectId,
            sender_id: req.session.user.id,
            isRead: false
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: error.message });
    }
});

// Marquer une notification comme lue
notificationRoutes.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id_notification: req.params.id,
                user_id: req.session.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }

        await notification.update({ isRead: true });
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// Accepter une invitation
notificationRoutes.put('/:id/accept', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { 
                id_notification: req.params.id,
                user_id: req.session.user.id,
                type: 'INVITATION',
                status: 'PENDING'
            },
            include: [{ model: Projet }]
        });
        
        if (!notification) {
            return res.status(404).json({ message: "Invitation non trouvée" });
        }

        await notification.update({ 
            status: 'ACCEPTED',
            isRead: true 
        });

        // Ici, vous ajouterez plus tard la logique pour ajouter l'utilisateur au projet

        res.json(notification);
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Refuser une invitation
notificationRoutes.put('/:id/decline', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { 
                id_notification: req.params.id,
                user_id: req.session.user.id,
                type: 'INVITATION',
                status: 'PENDING'
            }
        });
        
        if (!notification) {
            return res.status(404).json({ message: "Invitation non trouvée" });
        }

        await notification.update({ 
            status: 'DECLINED',
            isRead: true 
        });
        res.json(notification);
    } catch (error) {
        console.error('Error declining invitation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une notification
notificationRoutes.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id_notification: req.params.id,
                user_id: req.session.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }

        await notification.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: error.message });
    }
});

// Marquer toutes les notifications comme lues
notificationRoutes.put('/read-all', async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { 
                where: { 
                    user_id: req.session.user.id,
                    isRead: false
                }
            }
        );
        res.json({ message: "Toutes les notifications ont été marquées comme lues" });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: error.message });
    }
});

export default notificationRoutes;