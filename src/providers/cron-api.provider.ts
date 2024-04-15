import schedule from "node-schedule";
import { Client, Pool } from "pg";
import axios from "axios";
import { Model, ModelsProvider } from "./models.provider";
import { getConfig } from "./db";

const apiUrl = "https://openrouter.ai/api/v1/models";

export class CronApiProvider {
  private constructor(private pool: Pool) {}

  public static init(interval: string, pool: Pool) {
    const provider = new CronApiProvider(pool);

    schedule.scheduleJob(interval, () => {
      provider.getDataFromApi().catch((reason) => {
        console.error("[cron job] Error:");
        console.error(reason);
      });
    });
    provider.getDataFromApi().catch((reason) => {
      console.error("[cron job] Error:");
      console.error(reason);
    });
  }

  private async getDataFromApi() {
    const response = await axios.get(apiUrl);

    if (response.status != 200) {
      throw new Error(`Response status was '${response.status}'`);
    }

    const data = response.data.data as any[];
    const dbData: Model[][] = Array.from(Array(6), () => []);

    data.forEach((row) => {
      dbData[0].push(row.id);
      dbData[1].push(row.name);
      dbData[2].push(row.description);
      dbData[3].push(row.context_length ?? null);
      dbData[4].push(row.architecture?.modality ?? null);
      dbData[5].push(row.architecture?.tokenizer ?? null);
    });

    const client = new Client(getConfig());

    try {
      await client.connect();

      await client.query(`
          INSERT INTO ${ModelsProvider.getTableName()} (
            id, name, description, context_length, tokenizer, modality
          ) SELECT * FROM UNNEST ($1::text[], $2::text[], $3::text[], $4::int[], $5::text[], $6::text[])
          ON CONFLICT (id)
          DO UPDATE SET 
          name = excluded.name, description = excluded.description, 
          context_length = excluded.context_length, tokenizer = excluded.tokenizer, 
          modality = excluded.modality
        `, dbData);
    } catch (e) {
      console.error(e);
    } finally {
      await client.end();
    }
  }
}