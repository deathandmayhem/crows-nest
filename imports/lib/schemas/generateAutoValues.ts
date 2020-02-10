import t from 'io-ts';
import AutoValueType from './AutoValueType';
import ScalarCodec from './ScalarCodec';
import SchemaCodec, { TopLevelProps } from './SchemaCodec';

type Operation = 'insert' | 'update';

function valueFunc<T extends ScalarCodec>(
  operation: Operation,
  codec: AutoValueType<T, any>,
): (() => t.OutputOf<T>) | undefined {
  switch (operation) {
    case 'insert':
      return codec.onInsert;
    case 'update':
      return codec.onUpdate;
  }
}

/* eslint-disable no-param-reassign,@typescript-eslint/no-use-before-define */

function populateInterface<P extends TopLevelProps, Codec extends t.TypeC<P>>(
  operation: Operation,
  codec: Codec,
  context: any,
): void {
  Object.entries(codec.props).forEach(([k, v]) => {
    if (v instanceof AutoValueType) {
      const f = valueFunc(operation, v);
      if (f && (!v.overridable || !context[k])) {
        context[k] = f();
      }
    }
  });
}

function populatePartial<P extends TopLevelProps, Codec extends t.PartialC<P>>(
  operation: Operation,
  codec: Codec,
  context: any,
): void {
  Object.entries(codec.props).forEach(([k, v]) => {
    if (v instanceof AutoValueType) {
      const f = valueFunc(operation, v);
      if (f && (!v.overridable || !context[k])) {
        context[k] = f();
      }
    }
  });
}

function populateIntersection<
  CS extends [SchemaCodec, SchemaCodec, ...SchemaCodec[]],
  Codec extends t.IntersectionC<CS>,
>(
  operation: Operation,
  codec: Codec,
  context: any,
): void {
  codec.types.forEach((c) => {
    generateAutoValues(operation, c, context);
  });
}

export default function generateAutoValues<
  Codec extends SchemaCodec
>(
  operation: Operation,
  codec: Codec,
  context: t.TypeOf<Codec> = {},
): t.TypeOf<Codec> {
  if (codec instanceof t.InterfaceType) {
    populateInterface(operation, codec, context);
  } else if (codec instanceof t.PartialType) {
    populatePartial(operation, codec, context);
  } else if (codec instanceof t.IntersectionType) {
    populateIntersection(operation, codec, context);
  }
  return context;
}

/* eslint-enable no-param-reassign,@typescript-eslint/no-use-before-define */
