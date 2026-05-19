import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Impact } from "../config/db.config.js";

const dataPath = new URL("../data/impacts.json", import.meta.url);

async function importImpacts() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const impacts = JSON.parse(raw);
    const payload = impacts.map((i) => ({
      id_tarefa: i.id_tarefa,
      tipo_impacto: i.tipo_impacto,
      valor_por_unidade: i.valor_por_unidade,
      unidade: i.unidade,
    }));

    const transaction = await sequelize.transaction();
    try {
      await Impact.bulkCreate(payload, {
        transaction,
        validate: false,
        ignoreDuplicates: true,
      });
      await transaction.commit();
      console.log(`Imported ${payload.length} impacts successfully.`);
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

importImpacts();
