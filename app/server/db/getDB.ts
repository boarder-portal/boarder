import fs from 'fs-extra';
import path from 'path';

import { IDB } from 'server/types/db';

export default async function getDB(): Promise<IDB> {
  return fs.readJSON(path.resolve('./db.json'));
}
