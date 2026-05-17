import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Report } from "../config/db.config.js";

const dataPath = new URL("../data/reports.json", import.meta.url);

async function importReports() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const reports = JSON.parse(raw);
    const payload = reports.map((r) => ({
      id_utilizador: r.id_utilizador,
      mes: r.mes,
      semana: r.semana,
      data_geracao: r.data_geracao,
      conteudo: r.conteudo,
      caminho_relatorio: r.caminho_relatorio,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Report.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} reports successfully.`);
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

importReports();
