import fs from 'fs-extra';
import path from 'path';

import { DB } from 'server/types/db';

export default async function writeDB(db: DB): Promise<void> {
  await fs.writeJSON(path.resolve('./db.json'), db);
}
