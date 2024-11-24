import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const Status = sequelize.define('Status', {
    int_Status: {
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
    tableName: 'Status',
    timestamps: false
});

// Ajouter les valeurs par défaut
await sequelize.sync();
await Status.bulkCreate([
    { desc: "Not Started" },
    { desc: "Started" },
    { desc: "Finished" }
], { ignoreDuplicates: true });

export default Status;