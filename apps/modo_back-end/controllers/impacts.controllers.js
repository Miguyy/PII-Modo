// Import impacts data
/* import { Impact } from "../config/db.config.js"; */

// Controller to get all impacts
export const getAllImpacts = async (req, res, next) => {
  try {
    const impacts = await Impact.findAll();
    res.status(200).json(impacts);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
