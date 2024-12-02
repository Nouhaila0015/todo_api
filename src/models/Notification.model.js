import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./Utilisateur.model.js";
import Projet from "./Projet.model.js";

const Notification = sequelize.define('Notification', {
    id_notification: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_id: {  // ID de l'utilisateur qui envoie la notification
        type: DataTypes.INTEGER,
        allowNull: true
    },
    projet_id: {  // ID du projet concerné (pour les invitations)
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('INVITATION', 'SYSTEM', 'TASK_DUE', 'TASK_COMPLETED'),
        defaultValue: 'SYSTEM'
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {  // Pour les notifications qui nécessitent une action
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'NONE'),
        defaultValue: 'NONE'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Notification',
    timestamps: false
});

// Relations
Notification.belongsTo(Utilisateur, { as: 'user', foreignKey: 'user_id' });
Notification.belongsTo(Utilisateur, { as: 'sender', foreignKey: 'sender_id' });
Notification.belongsTo(Projet, { foreignKey: 'projet_id' });

export default Notification;