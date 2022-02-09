/* eslint-disable no-unused-expressions */
import { expectType } from 'tsd';
import Projected from '../../imports/lib/models/Projected';
import Projection from '../../imports/lib/models/Projection';

interface TestSchema {
  _id: string;
  title: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  arrayField: string[];
  objectField: {
    test1: string;
    test2: string;
  };
  arrayOfObjects: {
    test1: string;
    test2: string;
  }[];
}

function findProjected<
  T extends Projection<TestSchema> | undefined = undefined
>(_fields?: T): Projected<TestSchema, T> {
  return null as any;
}

expectType<TestSchema>(findProjected());
expectType<TestSchema>(findProjected({}));

const a = findProjected({
  title: 1,
  updatedAt: 1,
  arrayField: 1,
  objectField: 1,
  arrayOfObjects: 1,
  _id: 0,
});
expectType<string>(a.title);
expectType<Date | undefined>(a.updatedAt);
expectType<string>(a.arrayField[0]);
expectType<string>(a.objectField.test1);
expectType<string>(a.arrayOfObjects[0].test1);
// @ts-expect-error _id property explicitly filtered out
a._id;
// @ts-expect-error createdAt property not included
a.createdAt;

const b = findProjected({ title: 1 });
expectType<string>(b._id);
expectType<string>(b.title);
// @ts-expect-error updatedAt property not included
b.updatedAt;
// @ts-expect-error arrayField property not included
b.arrayField;
// @ts-expect-error objectField property not included
b.objectField;
// @ts-expect-error arrayOfObjects property not included
b.arrayOfObjects;

const c = findProjected({ _id: 1 });
expectType<{ _id: string }>(c);

const d = findProjected({ title: 0, objectField: 0, arrayOfObjects: 0 });
expectType<string>(d._id);
expectType<Date | undefined>(d.updatedAt);
// @ts-expect-error title property explicitly filtered out
d.title;
// @ts-expect-error objectField property explicitly filtered out
d.objectField;
// @ts-expect-error arrayOfObjects property explicitly filtered out
d.arrayOfObjects;

const e = findProjected({ 'objectField.test1': 1, 'arrayOfObjects.test1': 1 });
expectType<string>(e.objectField.test1);
expectType<string>(e.arrayOfObjects[0].test1);
// @ts-expect-error test2 property not included
e.objectField.test2;
// @ts-expect-error test2 property not included
e.arrayOfObjects[0].test2;
// @ts-expect-error other properties not included
e.title;

const f = findProjected({ 'objectField.test1': 0, 'arrayOfObjects.test1': 0 });
expectType<string>(f.title);
expectType<string>(f.objectField.test2);
expectType<string>(f.arrayOfObjects[0].test2);
// @ts-expect-error test1 property explicitly excluded
f.objectField.test1;
// @ts-expect-error test1 property explicitly excluded
f.arrayOfObjects[0].test1;
