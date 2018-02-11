export function getBlobDataURL(blob) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = ({ target }) => {
      if (reader) {
        reject(target.error);
      }
    };

    reader.onload = ({ target }) => {
      resolve(target.result);
    };

    reader.readAsDataURL(blob);
  });
}
