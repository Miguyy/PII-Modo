import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Task } from "../config/db.config.js";

const dataPath = new URL("../data/task.json", import.meta.url);

async function importTasks() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const tasks = JSON.parse(raw);
    const payload = tasks.map((t) => ({
      id_habito: t.id_habito,
      nome_tarefa: t.nome_tarefa,
      pontos_tarefa: t.pontos_tarefa ?? 0,
      tipo_tarefa: t.tipo_tarefa,
      localizacao_tarefa: t.localizacao_tarefa,
      prioridade_tarefa: t.prioridade_tarefa,
      duracao_temporizador: t.duracao_temporizador ?? null,
      quantidade_necessaria: t.quantidade_necessaria ?? null,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Task.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} tasks successfully.`);
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

importTasks();
