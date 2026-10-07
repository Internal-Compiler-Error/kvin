/**
 * Type declarations for kvin.js.
 *
 * The module exports an object which carries every property and method of a default KVIN
 * instance (methods are bound to the module object, so tuning parameters set on the module
 * object affect them), plus the KVIN constructor and the default instance itself:
 *
 *   const kvin = require('kvin');
 *   kvin.serialize(x);                // default context
 *   kvin.makeFunctions = true;        // tunes the default context
 *   const custom = new kvin.KVIN();   // custom context
 */

/** A constructor function, as stored in KVIN's constructor tables. */
type KVINConstructor = Function;

declare class KVIN {
  /**
   * @param ctors  constructors from another JS context (e.g. a vm context) which should be
   *               recognized in place of this context's standard classes; either a list of
   *               constructors or a dictionary of name -> constructor.
   */
  constructor(ctors?: ReadonlyArray<KVINConstructor | null | undefined> | Record<string, KVINConstructor | null | undefined>);

  /** Pre-defined constructors, indexed by the numeric `ctr` in prepared objects. Contains
   *  `undefined` in place of URL on platforms which lack it. */
  ctors: Array<KVINConstructor | undefined>;
  /** Standard constructors, keyed by name. */
  standardObjects: Record<string, KVINConstructor>;
  /** User-defined constructors, keyed by name, used during deserialization. */
  userCtors: Record<string, KVINConstructor>;
  /** Names of constructors which may be deserialized by name. */
  constructorAllowlist?: string[];

  /** When true, the deserializer may create functions; equivalent to eval() from a security POV. */
  makeFunctions: boolean;
  /** "speed" for fast operation, "size" for small output; undefined balances both. */
  tune?: 'speed' | 'size';
  typedArrayPackThreshold: number;
  scanArrayThreshold: number;
  /** Maximum number of arguments we can pass to a function in this engine. */
  maxFunArgs: number;
  /** Maximum number of times we will repeat a re-match instead of unbounded. */
  maxReRepeat: number;
  /** When set, overrides maxFunArgs as the segment size for packing typed arrays. */
  stackLimit?: number;

  serializeVerId: string;

  /* Public API */
  serialize(what: unknown): string;
  stringify(what: unknown): string;
  serializeAsync(value: unknown): Promise<string>;
  stringifyAsync(value: unknown): Promise<string>;
  deserialize(str: string): any;
  parse(str: string): any;
  marshal(what: unknown, seen?: unknown[]): KVIN.Marshaled;
  marshalAsync(value: unknown): Promise<KVIN.Marshaled>;
  unmarshal(obj: KVIN.Marshaled): any;

  /* Internals: preparation (marshaling) */
  prepare(seen: unknown[], o: unknown, where: string): KVIN.PreparedValue;
  prepare$Array(seen: unknown[], o: unknown[], where: string): KVIN.PreparedArray;
  prepare$Map(seen: unknown[], o: Map<unknown, unknown>, where: string): KVIN.PreparedMap;
  prepare$Set(seen: unknown[], set: Set<unknown>, where: string): KVIN.PreparedSet;
  prepare$WeakMap(o: WeakMap<object, unknown>): KVIN.PreparedWeakMap;
  prepare$ArrayBuffer(o: ArrayBufferView): KVIN.PreparedTypedArray | KVIN.PreparedArrayBuffer8 | KVIN.PreparedArrayBuffer16;
  prepare$ArrayBuffer8(o: ArrayBufferView): KVIN.PreparedArrayBuffer8;
  prepare$ArrayBuffer16(o: ArrayBufferView): KVIN.PreparedArrayBuffer16 | null;
  prepare$RegExp(o: RegExp): KVIN.PreparedRegExp;
  prepare$boxedPrimitive(o: String | Number | Boolean): KVIN.PreparedBoxedPrimitive;
  prepare$Error(seen: unknown[], o: Error, where: string): KVIN.PreparedError;
  prepare$Promise(seen: unknown[] & { promises?: Promise<unknown>[] }, promise: Promise<unknown>, where: string): KVIN.PreparedPromise;
  isPrimitiveLike(o: unknown, seen?: unknown[]): boolean;

  /* Internals: unpreparation (unmarshaling) */
  unprepare(seen: unknown[], po: KVIN.PreparedValue, position: string): any;
  unprepare$object(seen: unknown[], po: KVIN.PreparedObject, position: string): any;
  unprepare$function(seen: unknown[], po: KVIN.PreparedObject, position: string): any;
  unprepare$Array(seen: unknown[], po: KVIN.PreparedArray, position: string): unknown[];
  unprepare$Map(seen: unknown[], po: KVIN.PreparedMap, position: string): Map<unknown, unknown>;
  unprepare$Set(seen: unknown[], po: KVIN.PreparedSet, position: string): Set<unknown>;
  unprepare$Promise(seen: unknown[], po: KVIN.PreparedPromise, how: 'resolve' | 'reject', position: string): Promise<unknown>;
  unprepare$ArrayBuffer8(seen: unknown[], po: KVIN.PreparedArrayBuffer8, position: string): ArrayBufferView;
  unprepare$ArrayBuffer16(seen: unknown[], po: KVIN.PreparedArrayBuffer16, position: string): ArrayBufferView;
}

declare namespace KVIN {
  /** Output of marshal(); serializable with JSON.stringify. */
  type Marshaled = {
    _serializeVerId: string;
    what: PreparedValue;
  };

  /** Constructor label: an index into KVIN#ctors, or a constructor name. */
  type CtorLabel = number | string;

  /** Values which may appear in prepared arrays and property lists without a wrapper. */
  type JSONPrimitive = string | number | boolean;

  type PreparedValue =
    | JSONPrimitive
    | PreparedNumber
    | PreparedBigInt
    | PreparedRaw
    | PreparedUndefined
    | PreparedSymbol
    | PreparedSeen
    | PreparedArray
    | PreparedMap
    | PreparedSet
    | PreparedObject
    | PreparedWeakMap
    | PreparedBoxedPrimitive
    | PreparedRegExp
    | PreparedError
    | PreparedTypedArray
    | PreparedArrayBuffer8
    | PreparedArrayBuffer16
    | PreparedPromise;

  /** Finite numbers are stored as-is; NaN/Infinity as strings; -0 as JSON. */
  type PreparedNumber = number | { number: string } | { json: '-0' };

  type PreparedBigInt = { bigint: string };

  type PreparedRaw = { raw: JSONPrimitive | null };

  type PreparedUndefined = { undefined: true };

  type PreparedSymbol = { symbol: string | undefined };

  /** Back-reference to an earlier value in the object graph. */
  type PreparedSeen = { seen: number };

  type PreparedArray = {
    /** Elements; `{ lst: N }` repeats the previous element N times. */
    arr: Array<PreparedValue | { lst: number }>;
    /** Islands of data inside a sparse array, starting at index '@'. */
    isl?: Array<{ '@': number; arr: unknown[] | PreparedArray }>;
    /** Non-index properties, and lone elements of sparse arrays. */
    ps?: Record<string, PreparedValue>;
    len?: number;
  };

  type PreparedMap = {
    mapKeys: PreparedArray;
    mapVals: PreparedArray;
    ps?: Record<string, PreparedValue>;
  };

  type PreparedSet = { set: PreparedArray };

  /** Generic object, function, or instance of a (possibly user-defined) class. */
  type PreparedObject = {
    ctr: CtorLabel;
    ps?: Record<string, PreparedValue>;
    arg?: unknown;
    args?: unknown[];
    fnName?: string;
  };

  type PreparedWeakMap = { ctr: number; arg: [] };

  type PreparedBoxedPrimitive = { ctr: number; arg: string };

  type PreparedRegExp = { ctr: number; args: [source: string, flags: string] };

  type PreparedError = {
    ctr: 'Error';
    arg: string;
    ps: Record<string, unknown>;
  };

  /** Small typed arrays, or any typed array when tune is "speed". */
  type PreparedTypedArray = { ctr: number; arg: number[] };

  type PreparedIsland = { 0: string; '@': number };

  type PreparedArrayBuffer8 =
    | { ctr: CtorLabel; ab8: string }
    | { ctr: CtorLabel; isl8: PreparedIsland[]; len: number };

  type PreparedArrayBuffer16 =
    | { ctr: CtorLabel; ab16: string; eb?: number }
    | { ctr: CtorLabel; isl16: PreparedIsland[]; len: number; eb?: number };

  /** A settled Promise; only produced by marshalAsync/serializeAsync. */
  type PreparedPromise = { resolve?: PreparedValue; reject?: PreparedValue };
}

/** Shape of the module object. */
type KVINModule = KVIN & {
  /** Constructor for custom KVIN contexts. */
  KVIN: typeof KVIN;
  /** The default KVIN context. */
  base_kvin: KVIN;
};

declare const kvin: KVINModule;

/* Types reachable through the module, e.g. `kvin.KVIN`, `kvin.Marshaled`, `kvin.PreparedValue` */
type KVINInstance = KVIN;
declare namespace kvin {
  type KVIN = KVINInstance;
  type Marshaled = KVIN.Marshaled;
  type CtorLabel = KVIN.CtorLabel;
  type JSONPrimitive = KVIN.JSONPrimitive;
  type PreparedValue = KVIN.PreparedValue;
  type PreparedNumber = KVIN.PreparedNumber;
  type PreparedBigInt = KVIN.PreparedBigInt;
  type PreparedRaw = KVIN.PreparedRaw;
  type PreparedUndefined = KVIN.PreparedUndefined;
  type PreparedSymbol = KVIN.PreparedSymbol;
  type PreparedSeen = KVIN.PreparedSeen;
  type PreparedArray = KVIN.PreparedArray;
  type PreparedMap = KVIN.PreparedMap;
  type PreparedSet = KVIN.PreparedSet;
  type PreparedObject = KVIN.PreparedObject;
  type PreparedWeakMap = KVIN.PreparedWeakMap;
  type PreparedBoxedPrimitive = KVIN.PreparedBoxedPrimitive;
  type PreparedRegExp = KVIN.PreparedRegExp;
  type PreparedError = KVIN.PreparedError;
  type PreparedTypedArray = KVIN.PreparedTypedArray;
  type PreparedIsland = KVIN.PreparedIsland;
  type PreparedArrayBuffer8 = KVIN.PreparedArrayBuffer8;
  type PreparedArrayBuffer16 = KVIN.PreparedArrayBuffer16;
  type PreparedPromise = KVIN.PreparedPromise;
}

export = kvin;
