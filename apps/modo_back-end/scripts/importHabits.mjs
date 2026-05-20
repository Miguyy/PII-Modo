import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Habit } from "../config/db.config.js";

const dataPath = new URL("../data/habits.json", import.meta.url);

async function importHabits() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const habits = JSON.parse(raw);
    const payload = habits.map((h) => ({
      nome_habito: h.nome_habito,
      descricao_habito: h.descricao_habito,
      categoria: h.categoria,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Habit.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} habits successfully.`);
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

importHabits();
