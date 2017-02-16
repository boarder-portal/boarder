import Promise from 'el-promise';

export function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
