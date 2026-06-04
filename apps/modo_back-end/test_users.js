import { User } from './config/db.config.js'
import bcrypt from 'bcrypt'

async function listUsers() {
  const users = await User.findAll();
  console.log("Users:")
  users.forEach(u => console.log(u.email, u.hashed_password, u.tipo_utilizador))
  
  // Also try to verify the token for the first user
  // ...
  process.exit(0)
}

listUsers().catch(console.error)
