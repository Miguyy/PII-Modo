/*
	Purpose: Express router for Impact-related endpoints. Declares
	routes used to retrieve impacts and attaches authentication/validation
	middleware where required.
*/
import express from "express";

// Import middlewares for impacts resources
import { validateTaskId } from "../middlewares/impacts.middlewares.js";

// Import middleware to authenticate and authorize users
import { authenticateUser } from "../middlewares/users.middlewares.js";

// Import controllers for impacts resources
import { getAllImpacts } from "../controllers/impacts.controllers.js";

const router = express.Router();

/**
 * GET /
 * Purpose: Return a list of all impacts. Requires authentication.
 * Handler: `getAllImpacts`
 */
router.get("/", authenticateUser, getAllImpacts);

export default router;
