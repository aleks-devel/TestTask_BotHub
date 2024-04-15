import { Pool } from "pg";

export type Model = {
  id: string;
  name: string;
  description: string;
  context_length: number | null;
  tokenizer: string | null;
  modality: string;
}

export class ModelsProvider {
  constructor(private pool: Pool) {}

  public static getTableName() {
    return process.env.DB_DATABASE;
  }

  public async getAll() {
    const res = await this.pool.query(
      `SELECT * FROM ${ModelsProvider.getTableName()} ORDER BY id ASC`
    );
    return res.rows;
  }

  public async get(id: string) {
    const res = await this.pool.query(
      `SELECT * FROM ${ModelsProvider.getTableName()} WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  }

  public async create(values: Model) {
    const res = await this.pool.query(
      `SELECT COUNT(id) FROM ${ModelsProvider.getTableName()} WHERE id = $1`,
      [values.id]
    );

    if (parseInt(res.rows[0].count) > 0) {
      return 409;
    }

    await this.pool.query(`INSERT INTO ${ModelsProvider.getTableName()}(
        id, name, description, context_length, tokenizer, modality
    ) VALUES ($1, $2, $3, $4, $5, $6)`, Object.values(values));
  }

  public async update(id: string, values: Model) {
    const setFields = Object.keys(values).map((val, index) => `${val} = $${index + 2}`);

    await this.pool.query(`UPDATE ${ModelsProvider.getTableName()} SET
        ${setFields}
        WHERE id = $1
    `, [id, ...Object.values(values)]);
  }

  public async delete(id: string) {
    await this.pool.query(
      `DELETE FROM ${ModelsProvider.getTableName()} WHERE id = $1`,
      [id]
    );
  }
}