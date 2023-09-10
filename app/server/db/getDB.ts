import fs from 'fs-extra';
import path from 'path';

import { DB } from 'server/types/db';

export default async function getDB(): Promise<DB> {
  return fs.readJSON(path.resolve('./db.json'));
}
