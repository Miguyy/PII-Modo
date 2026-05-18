import fs from "fs/promises";
import "dotenv/config";
import { sequelize, User } from "../config/db.config.js";

const dataPath = new URL("../data/users.json", import.meta.url);

async function importUsers() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const users = JSON.parse(raw);

    const payload = users.map((u) => ({
      nome: u.nome,
      email: u.email,
      hashed_password: u.password ?? u.hashed_password,
      pontos: u.pontos ?? 0,
      nivel: u.nivel ?? 1,
      data_criacao_conta: u.data_criacao ?? u.data_criacao_conta ?? new Date(),
      tipo_utilizador: String(u.tipo_utilizador).toLowerCase().includes("admin")
        ? "Admin"
        : "Client",
      imagem_utilizador: u.imagem_utilizador ?? null,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await User.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} users successfully.`);
    } catch (err) {
      await transaction.rollback();
      throw err;
    } finally {
      await sequelize.close();
    }
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

importUsers();
