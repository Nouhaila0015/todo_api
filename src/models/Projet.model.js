import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./Utilisateur.model.js";

const Projet = sequelize.define('Projet', {
    id_projet: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Projet',
    timestamps: false
});

// Relation
Projet.belongsTo(Utilisateur, { foreignKey: 'created_by' });

export default Projet;