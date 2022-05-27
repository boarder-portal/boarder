import path from 'node:path';

export default function shortenImport(filename: string): string {
  const start = path.resolve('./app');

  return filename.slice(start.length + 1, filename.lastIndexOf('.')).replace(/\/index$/, '');
}
