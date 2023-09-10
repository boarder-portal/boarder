import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import fs from 'fs-extra';
import cp from 'node:child_process';
import util from 'node:util';

const exec = util.promisify(cp.exec);

export default async function modifyFile(filename: string, enterPath: (path: NodePath) => unknown): Promise<void> {
  const script = await fs.readFile(filename, 'utf8');
  const ast = parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  traverse(ast, {
    enter: enterPath,
  });

  const modified = generate(ast, {
    retainLines: true,
    retainFunctionParens: true,
  });

  await fs.writeFile(filename, modified.code);

  await exec(`prettier --write ${filename}`);
  await exec(`eslint --fix ${filename}`);
}
