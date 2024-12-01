import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./Utilisateur.model.js";
import Projet from "./Projet.model.js";
import Status from "./Status.model.js";

const ToDo = sequelize.define(
  "ToDo",
  {
    id_Tache: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true, // Deadline can be null
    },
    id_Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projetId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null initially if the task isn't assigned to a project
    },
    isToday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Defaults to not being in "Ma journée"
    },
    isImportant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Defaults to not being important
    },
    reminder: {
      type: DataTypes.DATE, // Date and time of the reminder
      allowNull: true,
    },
    repeat: {
      type: DataTypes.STRING, // For example: "daily", "weekly", "monthly"
      allowNull: true,
    },
  },
  {
    tableName: "ToDo",
    timestamps: false,
  }
);

// Relations
ToDo.belongsTo(Utilisateur, { foreignKey: "user_id" });
ToDo.belongsTo(Projet, { foreignKey: "projetId" });
ToDo.belongsTo(Status, { foreignKey: "id_Status" });

export default ToDo;
