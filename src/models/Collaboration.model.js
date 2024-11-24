import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./Utilisateur.model.js";
import Projet from "./Projet.model.js";
import Permission from "./Permission.model.js";

const Collaboration = sequelize.define('Collaboration', {
    id_membre: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_projet: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_permission: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Collaboration',
    timestamps: false
});

// Relations
Collaboration.belongsTo(Utilisateur, { foreignKey: 'id_membre' });
Collaboration.belongsTo(Projet, { foreignKey: 'id_projet' });
Collaboration.belongsTo(Permission, { foreignKey: 'id_permission' });

export default Collaboration;