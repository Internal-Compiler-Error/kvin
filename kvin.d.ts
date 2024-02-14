declare module KVIN {

    class KVIN {
        ctors: knownCtors[];
        userCtors: Record<any, any>;

        serializeVerId: string;

        standardObjects: Record<string, any>;

        tune: string;

        constructor(ctors: Array<any> | Object);

        marshal(what: any): any;

        marshalAsync(value: any, isRecursing: boolean): Promise<any>;

        unmarshal(obj: any): any;

        parse(str: string): any;

        deserialize(str: string): any;

        stringify(input: any): string;

        serialize(what: any): any;

        stringifyAsync(input: any): Promise<string>;

        serializeAsync(value: any): Promise<string>;

        prepare<T>(seen: any[], o: Preparable<T>, where: any): any;

        prepare$Array<T extends ArrayLike>(seen: any, o: T, where: any): any;

        prepare$Map<O extends Map<any, any>>(seen: any, o: O, where: any): any;

        prepare$WeakMap<T extends WeakMap<any, any>>(o: T): PreparedWeakMap;

        prepare$ArrayBuffer8(o): PreparedArrayBuffer8;

        prepare$ArrayBuffer16(o): PreparedArrayBuffer16 | null;

        prepare$ArrayBuffer(o: any): any;

        // TODO: technically it's their .constructor that is of PrimitiveLike
        prepare$boxedPrimitive<T extends PrimitiveLike>(o: T): PreparedBoxedPrimitive;

        prepare$RegExp<T extends RegExp>(o: T): PreparedRegExp;

        unprepare(seen: any, po: any, position: any): any;

        unprepare$ArrayBuffer8(seen, po, position): any;

        unprepare$ArrayBuffer16(seen, po, position): any;

        isPrimitiveLike(o: any, seen): boolean;
    }

    function prepare$number(n: number): PreparedNumber;

    function prepare$undefined(o: undefined): PreparedUndefined;

    function prepare$primitive<T extends PrimitiveLike>(primitive: T, where: any): PreparedPrimitive<T>;

    function prepare$bigint(n: bigint): PreparedBigInt;

    function prepare$Error<T extends Error>(o: T): PreparedError<T>;

    function unprepare$number(arg: any): number;

    function unprepare$bigint(arg: any): bigint;

    // TODO: tighten up the type
    type ArrayLike = PrimitiveLike | any;

    type PreparedBigInt = {
        bigint: string;
    }

    type PreparedPrimitive<T extends PrimitiveLike> = T | {
        raw: T
    } | T;

    // TODO: depends on PreparedArray being done
    type PreparedMap<O extends Map<any, any>> = {
        mapKeys: any[];
        mapVals: any[];
    }

    // singleton type for prepare$undefined
    type PreparedUndefined = {
        undefined: true
    };

    type PreparedNumber
        = {
            number: number;
        }
        | {
        json: "-0";
    }
        | number;

    type PreparedArray = {
        arr: any[];
    }

    type PreparedWeakMap = {
        ctr: number;
        arg: [];
    }

    type PreparedError<T extends Error> = {
        ctor: string,
        ps: ConditionalProps<T>,
        message: string
    }

    type HasProperties<T, Keys extends keyof any> = {
        [P in Keys]: P extends keyof T ? T[P] : never;
    };

    type PreparedArrayBuffer8 = {
        ctr: number;
        ab8: string;
    } | {
        ctr: number;
        isl8: Array<{
            '0': string,
            '@': number,
        }>;
        len: number;
    }

    type PreparedArrayBuffer16 = {
        ctr: number;
        ab16: string;
        eb?: number;
    } | {
        ctr: number;
        isl16: Array<{
            '0': string,
            '@': number,
        }>;
        len: number;
        eb?: number;
    }
    type ConditionalProps<T> = HasProperties<T, 'code' | 'stack' | 'line' | 'fileName'>;

    type PrimitiveLike = null | string | boolean | number | Record<string, never> | [];

    type knownCtors
        = ObjectConstructor
        | Int8ArrayConstructor
        | Uint8ArrayConstructor
        | Uint8ClampedArrayConstructor
        | Int16ArrayConstructor
        | Uint16ArrayConstructor
        | Int32ArrayConstructor
        | Uint32ArrayConstructor
        | Float32ArrayConstructor
        | Float64ArrayConstructor
        | RegExpConstructor
        | NumberConstructor
        | StringConstructor
        | BooleanConstructor
        | ArrayConstructor
        | FunctionConstructor
        | ErrorConstructor
        | PromiseConstructor
        | DateConstructor;

    type PreparedBoxedPrimitive = {
        ctr: number;
        arg: string;
    }

    type PreparedRegExp = {
        ctr: number;
        arg: string;
    }

    // TODO: both ArrayBuffer and ArrayBufferView?
    type Preparable<T>
        = number
        | bigint
        | string
        | undefined
        | Array<T>
        | ArrayBuffer
        | ArrayBufferView
        | Map<any, any>
        | WeakMap<any, any>
        | String
        | Number
        | Boolean
        | RegExp
        | Promise<T>
        | Error
        | Function
        | {toJSON: Function}
        | {toKVIN: Function}
        | {toString: Function}
        | Record<string, any>; // TODO: I mean this is really sad
}

export = KVIN;