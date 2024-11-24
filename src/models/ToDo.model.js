import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./Utilisateur.model.js";
import Projet from "./Projet.model.js";
import Status from "./Status.model.js";

const ToDo = sequelize.define('ToDo', {
    id_Tache: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    id_Status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projetId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'ToDo',
    timestamps: false
});

// Relations
ToDo.belongsTo(Utilisateur, { foreignKey: 'user_id' });
ToDo.belongsTo(Projet, { foreignKey: 'projetId' });
ToDo.belongsTo(Status, { foreignKey: 'id_Status' });

export default ToDo;