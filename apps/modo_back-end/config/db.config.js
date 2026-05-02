/* 

// Imports (example of how you should import the model files)
import LocationModel from "../models/locations.model.js";
import DecorationModel from "../models/decorations.model.js";
import UserDecorationModel from "../models/userDecorations.model.js";
import ReportModel from "../models/reports.model.js";
import NotificationModel from "../models/notifications.model.js";

// Model initialization
const Location = LocationModel(sequelize, Sequelize);
const Decoration = DecorationModel(sequelize, Sequelize);
const UserDecoration = UserDecorationModel(sequelize, Sequelize);
const Report = ReportModel(sequelize, Sequelize);
const Notification = NotificationModel(sequelize, Sequelize);

// 1:N Relationships
User.hasMany(Location, { foreignKey: 'userId' });
Location.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Report, { foreignKey: 'userId' });
Report.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// M:N Relationship between Users and Decorations through the UserDecoration table
User.belongsToMany(Decoration, { through: UserDecoration, foreignKey: 'userId' });
Decoration.belongsToMany(User, { through: UserDecoration, foreignKey: 'decorationId' });

// It is also useful to have direct 1:N relationships with the junction table for easier querying
User.hasMany(UserDecoration, { foreignKey: 'userId' });
UserDecoration.belongsTo(User, { foreignKey: 'userId' });
Decoration.hasMany(UserDecoration, { foreignKey: 'decorationId' });
UserDecoration.belongsTo(Decoration, { foreignKey: 'decorationId' });

*/