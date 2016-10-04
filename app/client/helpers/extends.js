import { D } from 'dwayne';

function extend(subCls, cls) {
  extendObject(subCls, cls);
  extendObject(subCls.prototype, cls.prototype);
}

function extendObject(o1, o2) {
  o1 = D(o1);

  D(o2).forEach((value, prop) => {
    if (o1.hasOwn(prop)) {
      o1.deepAssign(o2);
    } else {
      o1.$[prop] = value;
    }
  });
}

export { extend };
