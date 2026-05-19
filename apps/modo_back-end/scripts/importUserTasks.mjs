import fs from "fs/promises";
import "dotenv/config";
import { sequelize, UserTasks } from "../config/db.config.js";

const dataPath = new URL("../data/usersTasks.json", import.meta.url);

async function importUserTasks() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const userTasks = JSON.parse(raw);
    const payload = userTasks.map((u) => ({
      id_tarefa: u.id_tarefa,
      id_utilizador: u.id_utilizador,
      tarefa_ativa: u.tarefa_ativa ?? true,
      estado_tarefa: u.estado_tarefa ?? "Pending",
      progresso: u.progresso ?? 0,
      data_inicio: u.data_inicio ? new Date(u.data_inicio) : new Date(),
      data_conclusao: u.data_conclusao ? new Date(u.data_conclusao) : null,
    }));

    const transaction = await sequelize.transaction();
    try {
      await UserTasks.bulkCreate(payload, {
        transaction,
        validate: false,
        ignoreDuplicates: true,
      });
      await transaction.commit();
      console.log(`Imported ${payload.length} userTasks successfully.`);
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

importUserTasks();
