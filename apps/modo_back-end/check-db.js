import { AvatarDecoration } from "./config/db.config.js";
try {
  const count = await AvatarDecoration.count();
  console.log("AvatarDecoration count:", count);
  const decs = await AvatarDecoration.findAll();
  console.log("Decorations:", JSON.stringify(decs, null, 2));
  process.exit(0);
} catch (e) {
  console.error("Error:", e);
  process.exit(1);
}
