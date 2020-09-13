import fs from 'fs-extra';
import path from 'path';

import { IDB } from 'server/types/db';

export default async function writeDB(db: IDB): Promise<void> {
  await fs.writeJSON(path.resolve('./db.json'), db);
}
