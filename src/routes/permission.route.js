import express from 'express';
import Permission from '../models/Permission.model.js'; 

const routerPermission = express.Router();

// Route pour récupérer toutes les permissions
routerPermission.get('/permissions', async (req, res) => {
    try {
        const permissions = await Permission.findAll();
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des permissions', error });
    }
});

// Route pour créer une nouvelle permission
routerPermission.post('/permissions', async (req, res) => {
    const { desc } = req.body;
    if (!desc) {
        return res.status(400).json({ message: 'La description de la permission est requise.' });
    }

    try {
        const permission = await Permission.create({ desc });
        res.status(201).json(permission);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la permission', error });
    }
});

// Route pour récupérer une permission par son ID
routerPermission.get('/permissions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permission non trouvée' });
        }
        res.json(permission);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la permission', error });
    }
});

// Route pour mettre à jour une permission
routerPermission.put('/permissions/:id', async (req, res) => {
    const { id } = req.params;
    const { desc } = req.body;

    if (!desc) {
        return res.status(400).json({ message: 'La description de la permission est requise.' });
    }

    try {
        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permission non trouvée' });
        }

        permission.desc = desc;
        await permission.save();
        res.json(permission);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la permission', error });
    }
});

// Route pour supprimer une permission
routerPermission.delete('/permissions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permission non trouvée' });
        }

        await permission.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la permission', error });
    }
});

export default routerPermission;
