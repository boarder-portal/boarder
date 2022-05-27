import { ImportDeclaration, Program } from '@babel/types';

export default function addImport(program: Program, importDeclaration: ImportDeclaration): void {
  let lastImportIndex = -1;

  program.body.forEach((statement, index) => {
    if (statement.type === 'ImportDeclaration') {
      lastImportIndex = index;
    }
  });

  program.body.splice(lastImportIndex + 1, 0, importDeclaration);
}
