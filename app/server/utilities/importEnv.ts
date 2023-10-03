import path from 'node:path';

import { blue, bold } from 'colors';
import { config, parse } from 'dotenv';
import fs from 'fs-extra';

config({
  path: path.resolve('.env'),
});

config({
  path: path.resolve('.secret.env'),
});

const basicValues = parse(fs.readFileSync(path.resolve('.example.env')));
const secretValues = parse(fs.readFileSync(path.resolve('.secret.example.env')));

Object.keys({ ...basicValues, ...secretValues }).forEach((key) => {
  if (!process.env[key]) {
    console.error(`${blue(bold(key))} env variable not set`);

    process.exit(1);
  }
});
