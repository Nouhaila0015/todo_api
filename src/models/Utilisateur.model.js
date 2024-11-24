import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const Utilisateur = sequelize.define('Utilisateur', {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Utilisateur',
    timestamps: false
});

export default Utilisateur;