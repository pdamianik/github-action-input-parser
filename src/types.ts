export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type Defined<T> = T extends undefined | null ? never : T;
export type DefinedOne<T> = T extends Object ? { [Key in keyof T]: Defined<T[Key]> } : Defined<T>;
export type DefinedRecursive<T> = T extends Object ? { [Key in keyof T]: DefinedRecursive<T[Key]> } : Defined<T>;
export type Writeable<T extends Object> = { -readonly [Key in keyof T]: T[Key] }
export type Known<T> = T extends {} ? T : undefined;
export type Undefined<T> = T | undefined;
export type UndefinedZeroOne<T> = T extends Object ? { [Key in keyof T]: Undefined<T[Key]> } : Undefined<T>;
export type UndefinedOne<Tuple extends Object> = { [Index in keyof Tuple]: Tuple[Index] | undefined };
export type UndefinedRecursive<T> = T extends Object ? { [Key in keyof T]: UndefinedRecursive<T[Key]> } : Undefined<T>;
export type NonNullableRecursive<T> = T extends Object ? { [Key in keyof T]: NonNullableRecursive<T[Key]> } : NonNullable<T>;
export type ArrayElements<T extends readonly any[]> = T extends (infer E)[] ? E : never;

export type ParseFunction<T> = (raw: string) => T;

export const VALID_TYPES = new Set([String, Boolean, Number] as const);
export type BaseOptionType = StringConstructor | BooleanConstructor | NumberConstructor | ParseFunction<any>;
export type OptionType = BaseOptionType | readonly [...BaseOptionType[]] | undefined | unknown;
export type RequiredType = true | false | undefined | unknown;

type BasePrimitiveType<T extends BaseOptionType> =
    T extends StringConstructor ? string :
    T extends BooleanConstructor ? boolean :
    T extends NumberConstructor ? number :
    T extends ParseFunction<infer RT> ? RT :
    never;

type BasePrimitiveTuple<Tuple extends readonly [...BaseOptionType[]]> = {
    [Index in keyof Tuple]: BasePrimitiveType<Tuple[Index]>;
};

export type PrimitiveType<T extends OptionType> =
    T extends BaseOptionType ? BasePrimitiveType<T> :
    T extends (infer E extends BaseOptionType)[] ? BasePrimitiveType<E>[] :
    T extends readonly [infer E extends BaseOptionType] ? BasePrimitiveType<E>[] :
    T extends readonly [...BaseOptionType[]] ? BasePrimitiveTuple<T> :
    never;

type MergeTypeWithTuple<Type, Tuple extends readonly [...any[]]> = {
    [Index in keyof Tuple]: Type | Tuple[Index];
};

type MergeTupleWithTupleRequired<Tuple1 extends readonly [...any[]], Tuple2 extends readonly [...any[]]> = {
    //@ts-ignore
    [Index in keyof Tuple1]: Tuple1[Index] | Defined<Tuple2[Index]>;
}

type MergeTupleWithTupleOptional<Tuple1 extends readonly [...any[]], Tuple2 extends readonly [...any[]]> = {
    //@ts-ignore
    [Index in keyof Tuple1]: Tuple1[Index] | Tuple2[Index];
}

type RequiredArray<BOT extends BaseOptionType, DT extends readonly any[]> =
    DT extends readonly [...any[]] ?
    //@ts-ignore
    [...MergeTypeWithTuple<BasePrimitiveType<BOT>, DefinedOne<DT>>,
        ...BasePrimitiveType<BOT>[]] :
    (BasePrimitiveType<BOT> | Defined<ArrayElements<DT>>)[];

type OptionalArray<BOT extends BaseOptionType, DT extends readonly any[]> =
    DT extends readonly [...any[]] ?
    //@ts-ignore
    [...MergeTypeWithTuple<BasePrimitiveType<BOT>, DT>,
        ...(BasePrimitiveType<BOT> | undefined)[]] :
    (BasePrimitiveType<BOT> | ArrayElements<DT> | undefined)[];

type RequiredTuple<BOTT extends readonly [...BaseOptionType[]], DT extends readonly any[]> =
    DT extends readonly [...any[]] ?
    MergeTupleWithTupleRequired<BasePrimitiveTuple<BOTT>, DT> :
    MergeTypeWithTuple<Defined<ArrayElements<DT>>, BasePrimitiveTuple<BOTT>>;

type OptionalTuple<BOTT extends readonly [...BaseOptionType[]], DT extends readonly any[]> =
    DT extends readonly [...any[]] ?
    MergeTupleWithTupleOptional<BasePrimitiveTuple<BOTT>, DT> :
    MergeTypeWithTuple<ArrayElements<DT> | undefined, BasePrimitiveTuple<BOTT>>;

export type RequiredOptionPrimitiveResult<OT extends OptionType, DT> =
    OT extends undefined ? string | Defined<DT> :
    OT extends BaseOptionType ? BasePrimitiveType<OT> | Defined<DT> :
    OT extends readonly [infer E extends BaseOptionType] ?
    DT extends readonly any[] ? RequiredArray<E, DT> :
    (BasePrimitiveType<E> | Defined<DT>)[] :
    OT extends (infer E extends BaseOptionType)[] ?
    DT extends readonly any[] ? RequiredArray<E, DT> :
    (BasePrimitiveType<E> | Defined<DT>)[] :
    OT extends readonly [...BaseOptionType[]] ?
    DT extends readonly any[] ? RequiredTuple<Writeable<OT>, DT> :
    MergeTypeWithTuple<Defined<DT>, BasePrimitiveTuple<Writeable<OT>>> :
    never;

export type OptionalOptionPrimitiveResult<OT extends OptionType, DT> =
    OT extends undefined ? string | DT :
    OT extends BaseOptionType ? BasePrimitiveType<OT> | DT :
    OT extends readonly [infer E extends BaseOptionType] ?
    DT extends readonly any[] ? OptionalArray<E, DT> :
    (BasePrimitiveType<E> | DT)[] | undefined :
    OT extends (infer E extends BaseOptionType)[] ?
    DT extends readonly any[] ? OptionalArray<E, DT> :
    (BasePrimitiveType<E> | DT)[] | undefined :
    OT extends readonly [...BaseOptionType[]] ?
    DT extends readonly any[] ? OptionalTuple<Writeable<OT>, DT> :
    //@ts-ignore
    MergeTypeWithTuple<DT, BasePrimitiveTuple<Writeable<OT>>> | undefined :
    never;

export type OptionPrimitiveResult<OT extends OptionType, DT, Required extends RequiredType> =
    Required extends true ?
    RequiredOptionPrimitiveResult<OT, DT> :
    OptionalOptionPrimitiveResult<OT, DT>;

export interface BaseInputOption<OT extends OptionType, DT, RT extends RequiredType> {
    input: string | readonly string[],
    type?: OT,
    required?: RT,
    default?: DT,
}

export interface RequiredInputOption<OT extends OptionType, DT> extends BaseInputOption<OT, DT, true> {
    required: true,
}

export interface OptionalInputOption<OT extends OptionType, DT> extends BaseInputOption<OT, DT, false> {
    required?: false,
}

export type InputOption<OT extends OptionType, DT, RT extends RequiredType> = RequiredInputOption<OT, DT> | OptionalInputOption<OT, DT>;

export interface BaseInputsOption<OT extends OptionType, DT, RT extends RequiredType> {
    input?: string | readonly string[],
    type?: OT,
    required?: RT,
    default?: DT,
}

export interface RequiredInputsOption<OT extends OptionType, DT> extends BaseInputsOption<OT, DT, true> {
    required: true,
}

export interface OptionalInputsOption<OT extends OptionType, DT> extends BaseInputsOption<OT, DT, false> {
    required?: false,
}

export type InputsOption<OT extends OptionType, DT, RT extends RequiredType> = RequiredInputsOption<OT, DT> | OptionalInputsOption<OT, DT>;
