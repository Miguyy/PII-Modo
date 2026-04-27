import express from "express";
// Import controllers for impacts resources
import { getAllImpacts } from "../controllers/impacts.controllers.js";

const router = express.Router();

router.get("/", getAllImpacts);

export default router;
