const createError = ({ status, description, errors }) => {
  const error = new Error(description);
  error.status = status;
  if (errors) {
    error.errors = errors;
  }
  return error;
};

export const validationError = (errors, description = "Validation failed") =>
  createError({
    status: 400,
    description,
    errors,
  });

export const missingFieldsValidationError = (missingFields) => {
  const errors = missingFields.reduce((acc, field) => {
    acc[field] = [`${field} is required`];
    return acc;
  }, {});

  return validationError(errors, "Missing required fields");
};

export const notFoundError = (resource, id) =>
  createError({
    status: 404,
    description: "Resource not found",
    errors: {
      [resource]: [`Resource ${resource} with ID ${id} not found`],
    },
  });

export const sequelizeValidationError = (errors = []) => {
  const groupedErrors = errors.reduce((acc, currentError) => {
    const path = currentError.path || "general";

    if (!acc[path]) {
      acc[path] = [];
    }

    acc[path].push(currentError.message);
    return acc;
  }, {});

  return validationError(groupedErrors);
};

export const conflictError = (errors, description = "Conflict found") =>
  createError({
    status: 409,
    description,
    errors,
  });

export const genericError = (description = "Internal server error") =>
  createError({
    status: 500,
    description,
  });
