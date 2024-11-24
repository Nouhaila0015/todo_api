import express from "express";
import Status from "../models/Status.model.js";

const routerStatus = express.Router();

routerStatus.get("/", async (req, res) => {
    try {
        const statusList = await Status.findAll();
        res.status(200).json(statusList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default routerStatus;