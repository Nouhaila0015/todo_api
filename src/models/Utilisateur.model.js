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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
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