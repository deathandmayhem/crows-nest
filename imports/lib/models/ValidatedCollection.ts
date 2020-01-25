import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { NpmModuleMongo } from 'meteor/npm-mongo';
import { Promise } from 'meteor/promise';
import t from 'io-ts';
import MongoProjection, { MongoFieldsSelector } from './MongoProjection';
import codecToSchema, { ValidatableCodec } from './codecToSchema';

type FindSelector<T> = Mongo.Selector<T> | string;
export type FindOneOptions<T, U extends MongoFieldsSelector<T>> = {
  sort?: [{ [k in keyof T]: -1 | 1 }];
  skip?: number;
  fields?: U;
}
export type FindOptions<T, U> = FindOneOptions<T, U> & {
  limit?: number;
}

// Extend the Mongo types to support well-typed projections
declare module 'meteor/mongo' {
  // eslint-disable-next-line no-shadow
  namespace Mongo {
    interface Collection<T> {
      find<U extends MongoFieldsSelector<T>>(
        selector?: FindSelector<T>,
        options?: FindOptions<T, U>,
      ): Mongo.Cursor<MongoProjection<T, U>>;
      findOne<U extends MongoFieldsSelector<T>>(
        selector?: FindSelector<T>,
        options?: FindOneOptions<T, U>,
      ): MongoProjection<T, U> | undefined;
    }
  }
}

export default class ValidatedCollection<T extends {_id: t.Branded<string, any>}>
  extends Mongo.Collection<T> {
  public name: string;

  public codec: t.Type<T, any> & ValidatableCodec

  // Don't accept any options for collections. We don't want people overriding
  // the ID type, nor do we want transformations (since that is effectively a
  // map on the return value)
  constructor(name: string, codec: t.Type<T, any> & ValidatableCodec) {
    super(name);
    this.name = name;
    this.codec = codec;
  }

  updateSchema(): void {
    if (Meteor.isServer) {
      const validator = { $jsonSchema: codecToSchema(this.codec) };
      const db = this.rawDatabase() as NpmModuleMongo.Db;
      try {
        Promise.await(db.createCollection(this.name, { validator }));
      } catch (e) {
        if (!(e instanceof NpmModuleMongo.MongoError) || e.code !== 48 /* NamespaceExists */) {
          throw e;
        }
        Promise.await(db.command({ collMod: this.name, validator }));
      }
    }
  }

  find<U extends MongoFieldsSelector<T>>(
    selector?: FindSelector<T>,
    options?: FindOptions<T, U>,
  ): Mongo.Cursor<MongoProjection<T, U>> {
    return super.find(selector, options) as Mongo.Cursor<MongoProjection<T, U>>;
  }

  findOne<U extends MongoFieldsSelector<T>>(
    selector?: FindSelector<T>,
    options?: FindOneOptions<T, U>,
  ): MongoProjection<T, U> | undefined {
    return super.findOne(selector, options as any) as MongoProjection<T, U> | undefined;
  }
}
