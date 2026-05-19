// Import models (adjust according to the exact names exported in your db.config.js)
import { AvatarDecoration } from "../config/db.config.js";

// Controller to create a new avatar decoration in the global catalog
// POST /avatar-decorations
export const createDecoration = async (req, res, next) => {
  try {
    const { nome, nivel_necessario, preco_pontos, imagem_url } = req.body;

    const decoration = await Decoration.create({
      nome,
      nivel_necessario,
      preco_pontos,
      imagem_url,
    });

    // Include HATEOAS links
    const response = {
      ...decoration.toJSON(),
      links: {
        self: `/avatar-decorations/${decoration.id}`,
        all_decorations: `/avatar-decorations`,
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

// Controller to list all available decorations in the game
// GET /avatar-decorations
export const getDecorations = async (req, res, next) => {
  try {
    const decorations = await Decoration.findAll({
      order: [["nivel_necessario", "ASC"]], // Order by the required level to unlock
    });

    // Include HATEOAS links for each item
    const response = decorations.map((dec) => ({
      ...dec.toJSON(),
      links: {
        self: `/avatar-decorations/${dec.id}`,
      },
    }));

    res.status(200).json(response);
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to update a specific decoration
// PATCH /avatar-decorations/:id
export const updateDecoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, nivel_necessario, preco_pontos, imagem_url } = req.body;

    const decoration = await Decoration.findByPk(id);

    if (!decoration) {
      const err = new Error("Decoration not found.");
      err.status = 404;
      return next(err);
    }

    // Update only the provided fields (PATCH behavior)
    if (nome) decoration.nome = nome;
    if (nivel_necessario !== undefined)
      decoration.nivel_necessario = nivel_necessario;
    if (preco_pontos !== undefined) decoration.preco_pontos = preco_pontos;
    if (imagem_url) decoration.imagem_url = imagem_url;

    await decoration.save();

    const response = {
      ...decoration.toJSON(),
      links: {
        self: `/avatar-decorations/${decoration.id}`,
        all_decorations: `/avatar-decorations`,
      },
    };

    res.status(200).json(response);
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

// Controller to remove a decoration from the catalog
// DELETE /avatar-decorations/:id
export const deleteDecoration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const decoration = await Decoration.findByPk(id);

    if (!decoration) {
      const err = new Error("Decoration not found.");
      err.status = 404;
      return next(err);
    }

    // Deleting the decoration.
    // NOTE: If the database relations are set up with 'ON DELETE CASCADE'
    // for the user_decorations junction table, this will automatically
    // remove the decoration from all users' accounts.
    await decoration.destroy();

    res.status(200).json({
      message:
        "Decoration deleted successfully. It has been removed from the system and all associated user accounts.",
      links: {
        all_decorations: `/avatar-decorations`,
      },
    });
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
