import { expectType } from 'tsd';
import MongoProjection, { MongoFieldsSelector } from '../../imports/lib/models/MongoProjection';

interface TestSchema {
  _id: string;
  title: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

function findProjected<
  T extends MongoFieldsSelector<TestSchema>
>(_fields?: T): MongoProjection<TestSchema, T> {
  return null as any;
}

expectType<TestSchema>(findProjected());
expectType<TestSchema>(findProjected({}));
expectType<Pick<TestSchema, 'title' | 'updatedAt'>>(
  findProjected({ title: 1, updatedAt: 1, _id: 0 }),
);
expectType<Pick<TestSchema, '_id' | 'title'>>(
  findProjected({ title: 1 }),
);
expectType<Pick<TestSchema, '_id'>>(
  findProjected({ _id: 1 }),
);
expectType<Omit<TestSchema, 'title'>>(
  findProjected({ title: 0 }),
);
