export async function toreload() {
  const { emit } = await import('../app/server/helpers/livereload');

  emit('toreload');
}

export async function reload() {
  const { emit } = await import('../app/server/helpers/livereload');

  emit('reload');
}

export async function cssUpdated() {
  const { emit } = await import('../app/server/helpers/livereload');

  emit('css-updated');
}
