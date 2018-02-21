import gulp from 'gulp';

import { watchClient } from './client';
import { watchServer } from './server';
import { watchLocales } from './locales';
import { watchLess } from './styles';

import { ensureDirs } from './dirs';
import { copyFonts } from './fonts';
import { copyFlags } from './flags';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const defaultTask = gulp.parallel(watchServer, watchClient, watchLess, watchLocales);

export { defaultTask as default };

export * from './client';
export * from './db';
export * from './dirs';
export * from './flags';
export * from './fonts';
export * from './lint';
export * from './livereload';
export * from './locales';
export * from './server';
export * from './styles';

export const init = gulp.parallel(ensureDirs, copyFonts, copyFlags);
