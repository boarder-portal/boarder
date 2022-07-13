export default function getUniqCombinationsByN<T>(a: T[], c: number): T[][] {
  const index: number[] = [];
  const n = a.length;

  for (let j = 0; j < c; j++) {
    index[j] = j;
  }

  index[c] = n;

  let ok = true;
  const result: T[][] = [];

  while (ok) {
    const comb: T[] = [];

    for (let j = 0; j < c; j++) {
      comb[j] = a[index[j]];
    }

    result.push(comb);

    ok = false;

    for (let j = c; j > 0; j--) {
      if (index[j - 1] < index[j] - 1) {
        index[j - 1]++;

        for (let k = j; k < c; k++) {
          index[k] = index[k - 1] + 1;
        }

        ok = true;

        break;
      }
    }
  }

  return result;
}
