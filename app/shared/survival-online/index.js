function deepMap(obj, f, ctx) {
  if (Array.isArray(obj)) {
    return obj.map(function(val, key) {
      return (typeof val === 'object') ? deepMap(val, f, ctx) : f.call(ctx, val, key, obj);
    });
  } else if (typeof obj === 'object') {
    const res = {};
    for (let key in obj) {
      const val = obj[key];
      if (typeof val === 'object') {
        res[key] = deepMap(val, f, ctx);
      } else {
        res[key] = f.call(ctx, val, key, obj);
      }
    }
    return res;
  } else {
    return obj;
  }
}

exports.deepMap = deepMap;
