import path from 'node:path';

import fs from 'fs-extra';

import migrations from './';

const VERSION_PATH = path.resolve('./app/server/db/version');

export interface Migration {
  up?(): Promise<void>;
  down?(): Promise<void>;
}

export async function migrate(toVersion?: number): Promise<void> {
  let currentVersion: number;

  try {
    currentVersion = Number(await fs.readFile(VERSION_PATH, 'utf8'));
  } catch (e) {
    currentVersion = 0;
  }

  const version = toVersion ?? migrations.length;

  if (version === currentVersion) {
    return;
  }

  console.log(`Migrating ${currentVersion} -> ${version}`);

  if (version > currentVersion) {
    for (let i = currentVersion; i < version; i++) {
      await migrations[i].up?.();
    }
  } else {
    for (let i = currentVersion - 1; i >= version; i--) {
      await migrations[i].down?.();
    }
  }

  await fs.writeFile(VERSION_PATH, String(version), 'utf8');
}
