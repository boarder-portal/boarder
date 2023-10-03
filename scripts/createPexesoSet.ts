import fs from 'fs-extra';
import path from 'path';

const [name = 'unnamed'] = process.argv.slice(2);
const setDir = path.resolve(`./public/games/pexeso/images/sets/${name}`);

fs.mkdirsSync(setDir);

for (let i = 0; i < 60; i++) {
  fs.mkdirsSync(`${setDir}/${i}`);
}
