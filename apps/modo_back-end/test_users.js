/* 
  This is a simple test script to list all users in the database and verify their passwords.
  Run it with: node test_users.js
  Make sure to have your database running and properly configured in db.config.js
*/

import { User } from "./config/db.config.js";
import bcrypt from "bcrypt";

async function listUsers() {
  const users = await User.findAll();
  console.log("Users:");
  users.forEach((u) =>
    console.log(u.email, u.hashed_password, u.tipo_utilizador),
  );

  // Also try to verify the token for the first user
  // ...
  process.exit(0);
}

listUsers().catch(console.error);
