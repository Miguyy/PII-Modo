// Import user, decoration and userdecoration data
import { User, Decoration, UserDecoration } from "../config/db.config.js";

// Controller to unlock or associate a decoration to a user
// POST /users/:userId/avatar-decorations
export const unlockDecoration = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { decorationId } = req.body; // Expecting the decoration ID in the body

    // 1. Verify if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // 2. Verify if decoration exists in the global catalog
    const decoration = await Decoration.findByPk(decorationId);
    if (!decoration) {
      const err = new Error("Decoration not found in catalog.");
      err.status = 404;
      return next(err);
    }

    // 3. Check if the user already has this decoration
    const existingAssociation = await UserDecoration.findOne({
      where: { userId, decorationId }
      where: { userId, decorationId }
    });

    if (existingAssociation) {
      const err = new Error("User already owns this decoration.");
      err.status = 409; // Conflict
      return next(err);
    }

    // 4. Create the association (Unlock)
    const userDecoration = await UserDecoration.create({
      userId,
      decorationId,
      is_active: false // Unlocked, but not active by default
      is_active: false // Unlocked, but not active by default
    });

    const response = {
      message: "Decoration unlocked successfully.",
      data: userDecoration,
      links: {
        self: `/users/${userId}/avatar-decorations`,
        activate: `/users/${userId}/avatar-decorations/${decorationId}`
      }
        activate: `/users/${userId}/avatar-decorations/${decorationId}`
      }
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

// Controller to list a user's unlocked decorations
// GET /users/:userId/avatar-decorations
export const getUserDecorations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // Fetch all decorations associated with this user
    // Include the actual Decoration model to get name, image_url, etc.
    const userDecorations = await UserDecoration.findAll({
      where: { userId },
      include: [
        {
          model: Decoration,
          attributes: ['nome', 'imagem_url', 'nivel_necessario'] 
        }
      ]
          attributes: ['nome', 'imagem_url', 'nivel_necessario'] 
        }
      ]
    });

    const response = userDecorations.map((ud) => ({
      ...ud.toJSON(),
      links: {
        activate: `/users/${userId}/avatar-decorations/${ud.decorationId}`
      }
        activate: `/users/${userId}/avatar-decorations/${ud.decorationId}`
      }
    }));

    res.status(200).json(response);
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to activate a specific decoration on the avatar
// PATCH /users/:userId/avatar-decorations/:decorationId
export const activateDecoration = async (req, res, next) => {
  try {
    const { userId, decorationId } = req.params;

    // 1. Find the specific user-decoration association
    const userDecoration = await UserDecoration.findOne({
      where: { userId, decorationId }
      where: { userId, decorationId }
    });

    if (!userDecoration) {
      const err = new Error("Decoration not found in user's inventory.");
      err.status = 404;
      return next(err);
    }

    // 2. Business Logic: Usually, a user can only have ONE active decoration.
    // So we first deactivate all other decorations for this user.
    await UserDecoration.update(
      { is_active: false },
      { where: { userId } }
    );
    await UserDecoration.update(
      { is_active: false },
      { where: { userId } }
    );

    // 3. Activate the chosen decoration
    userDecoration.is_active = true;
    await userDecoration.save();

    res.status(200).json({
      message: "Avatar decoration activated successfully.",
      data: userDecoration,
      links: {
        inventory: `/users/${userId}/avatar-decorations`
      }
    });
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};