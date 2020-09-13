import fs from 'fs-extra';
import path from 'path';

import writeDB from 'server/db/writeDB';

(async () => {
  await fs.remove(path.resolve('./db.json'));

  await writeDB({
    users: [],
  });
})();
