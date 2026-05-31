/*
	Purpose: Express router for Impact-related endpoints. Declares
	routes used to retrieve impacts and attaches authentication/validation
	middleware where required.
*/

import express from "express";

// Import middlewares for impacts resources
import { validateTaskId } from "../middlewares/impacts.middlewares.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";

// Import controllers for impacts resources
import {
  getAllImpacts,
  createImpact,
  deleteImpact,
} from "../controllers/impacts.controllers.js";

const router = express.Router();

/**
 * GET /
 * Purpose: Return a list of all impacts. Requires authentication.
 * Handler: `getAllImpacts`
 */
router.get("/", authenticateUser, getAllImpacts);
// Admin-only: creating impacts must be done by admin
router.post("/", authenticateUser, authorizeAdmin, createImpact);

// Delete an impact by id
router.delete(
  "/:impactId",
  authenticateUser,
  authorizeAdmin,
  async (req, res, next) => {
    // simple numeric validation for impactId
    const { impactId } = req.params;
    if (!Number.isInteger(Number(impactId)) || Number(impactId) <= 0) {
      return res.status(400).json({
        description: "Invalid request.",
        errors: { impactId: ["Invalid impact ID format."] },
      });
    }
    next();
  },
  deleteImpact,
);

export default router;
