import path from 'path';
import fs from 'fs-promise';

export function ensureDirs() {
  return Promise.all([
    fs.ensureFile(path.resolve('./logs/server.log')),
    fs.ensureDir(path.resolve('./tmp/uploads'))
  ]);
}
