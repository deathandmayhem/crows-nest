import { Meteor } from 'meteor/meteor';
import { Mongo, MongoInternals } from 'meteor/mongo';
import t from 'io-ts';
import SchemaCodec from '../schemas/SchemaCodec';
import WithoutAutoValues from '../schemas/WithoutAutoValues';
import codecToSchema from '../schemas/codecToSchema';
import generateAutoValues from '../schemas/generateAutoValues';
import MongoModifier from './MongoModifier';
import MongoProjection, { MongoFieldsSelector } from './MongoProjection';

const { MongoError } = MongoInternals.NpmModules.mongodb.module;

type FindSelector<T> = Mongo.Selector<T> | string;
export type FindOneOptions<T, U extends MongoFieldsSelector<T>> = {
  sort?: Partial<{ [k in keyof T]: -1 | 1 }>;
  skip?: number;
  fields?: U;
}
export type FindOptions<T, U> = FindOneOptions<T, U> & {
  limit?: number;
}

/**
 * ValidatedCollection is similar to {@link Mongo.Collection}, but attempts to
 * bring in as much safety and schema support as possible from the type system.
 * This includes auto-populating fields declared as
 * {@link ../schemas/AutoValueType#AutoValueType} on `insert` and `update` (and
 * not requiring those fields in the arguments to `insert` and `update`).
 */
export default class ValidatedCollection<
  Codec extends SchemaCodec,
  T extends t.TypeOf<Codec>
> {
  public name: string;

  public codec: Codec;

  public underlying: Mongo.Collection<T>;

  // Don't accept any options for collections. We don't want people overriding
  // the ID type, nor do we want transformations (since that is effectively a
  // map on the return value)
  constructor(name: string, codec: Codec) {
    this.underlying = new Mongo.Collection(name);
    this.name = name;
    this.codec = codec;
  }

  async updateSchema(): Promise<void> {
    if (Meteor.isServer) {
      const validator = { $jsonSchema: codecToSchema(this.codec) };
      const db = this.underlying.rawDatabase();
      try {
        await db.command({ collMod: this.name, validator });
      } catch (e) {
        if (!(e instanceof MongoError) || e.code !== 26 /* NamespaceNotFound */) {
          throw e;
        }

        await db.createCollection(this.name, { validator });
      }
    }
  }

  find<U extends MongoFieldsSelector<T>>(
    selector?: FindSelector<T>,
    options?: FindOptions<T, U>,
  ): Mongo.Cursor<MongoProjection<T, U>> {
    return this.underlying.find(selector, options as any) as Mongo.Cursor<MongoProjection<T, U>>;
  }

  findOne<U extends MongoFieldsSelector<T>>(
    selector?: FindSelector<T>,
    options?: FindOneOptions<T, U>,
  ): MongoProjection<T, U> | undefined {
    return this.underlying.findOne(selector, options as any) as MongoProjection<T, U> | undefined;
  }

  insert(doc: WithoutAutoValues<Codec>, callback?: (err?: Error, id?: T['_id']) => void): T['_id'] {
    const autoValues = generateAutoValues('insert', this.codec);
    return this.underlying.insert({ ...autoValues, ...(doc as any) }, callback);
  }

  update(
    selector: FindSelector<T>,
    modifier: MongoModifier<WithoutAutoValues<Codec>>,
    options?: {
      multi?: boolean;
    },
    callback?: (err?: Error, modified?: number) => void,
  ): number {
    const autoValues = generateAutoValues('update', this.codec);
    const fullModifier = {
      ...modifier,
      $set: {
        ...autoValues,
        ...modifier.$set,
      },
    };
    return this.underlying.update(selector, fullModifier as any, options, callback);
  }

  remove(selector: FindSelector<T>, callback?: (err?: Error, removed?: number) => void): number {
    return this.underlying.remove(selector, callback);
  }
}
