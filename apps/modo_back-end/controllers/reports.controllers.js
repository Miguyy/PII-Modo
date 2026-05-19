// Import reports data
import { Report, User } from "../config/db.config.js";

// Controller to create a new report for a specific user
// POST /users/:userId/reports
export const createReport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Assuming some standard report fields. Adjust to your actual model.
    const { titulo, periodo, dados_estatisticos, url_pdf } = req.body;

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // Create the report associated with the user
    const report = await Report.create({
      titulo,
      periodo,
      dados_estatisticos,
      url_pdf,
      userId // Foreign key
    });

    // Include HATEOAS links
    const response = {
      ...report.toJSON(),
      links: {
        self: `/reports/${report.id}`,
        user: `/users/${userId}`
      },
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => e.message);
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to list reports (filtered by user if userId is provided in query)
// GET /reports?userId={id}
export const getReports = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let whereClause = {};

    // If a userId is passed, we validate it and filter the results
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        const err = new Error("User not found.");
        err.status = 404;
        return next(err);
      }
      whereClause.userId = userId;
    }

    // Fetch the reports
    const reports = await Report.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']] // Newest reports first
    });

    // Include HATEOAS links
    const response = reports.map((rep) => ({
      ...rep.toJSON(),
      links: {
        self: `/reports/${rep.id}`,
        user: `/users/${rep.userId}`
      },
    }));

    res.status(200).json(response);
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to view a specific report details
// GET /reports/:id
export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);

    if (!report) {
      const err = new Error("Report not found.");
      err.status = 404;
      return next(err);
    }

    // Include HATEOAS links
    const response = {
      ...report.toJSON(),
      links: {
        self: `/reports/${report.id}`,
        all_user_reports: `/reports?userId=${report.userId}`
      },
    };

    res.status(200).json(response);
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};