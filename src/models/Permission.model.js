import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const Permission = sequelize.define('Permission', {
    id_permission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    desc: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Permission',
    timestamps: false
});

// Ajouter les valeurs par défaut
await sequelize.sync();
await Permission.bulkCreate([
    { desc: "Viewer" },
    { desc: "Editor" }
], { ignoreDuplicates: true });

export default Permission;