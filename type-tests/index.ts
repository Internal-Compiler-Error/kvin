/* Compile-only checks for kvin.d.ts; run with `npm run typecheck`. */
import kvin = require('../kvin');

/* default context, via the module object */
const s: string = kvin.serialize({ a: 1 });
const v: any = kvin.deserialize(s);
const s2: string = kvin.stringify([1, 2]);
kvin.parse(s2);
const m: kvin.Marshaled = kvin.marshal(v);
kvin.unmarshal(m);
kvin.serializeAsync(Promise.resolve(1)).then((str: string) => str);
kvin.marshalAsync({}).then((mm: kvin.Marshaled) => mm.what);

/* tuning the default context */
kvin.makeFunctions = true;
kvin.tune = 'size';
kvin.typedArrayPackThreshold = 16;
kvin.userCtors.Person = function Person() {};
kvin.constructorAllowlist = ['Person'];

/* custom contexts */
const a: kvin.KVIN = new kvin.KVIN();
const b = new kvin.KVIN([Object, Array]);
const c = new kvin.KVIN({ Object, Array });
const d: kvin.KVIN = kvin.base_kvin;
a.tune = 'speed';
b.serialize(c.deserialize(d.serialize(null)));

/* prepared shapes */
const re: kvin.PreparedRegExp = a.prepare$RegExp(/x/g);
const [source, flags]: [string, string] = re.args;
const err: kvin.PreparedError = a.prepare$Error([], new Error('e'), 'top');
const msg: string = err.arg;
const n: kvin.PreparedNumber = { number: 'NaN' };

// @ts-expect-error tune only accepts 'speed' | 'size'
a.tune = 'fast';
// @ts-expect-error deserialize takes a string
kvin.deserialize({});

export { source, flags, msg, n };
