import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { NpmModuleMongo } from 'meteor/npm-mongo';
import { Promise } from 'meteor/promise';
import t from 'io-ts';
import codecToSchema, { ValidatableCodec } from './codecToSchema';

export default class ValidatedCollection<T extends {_id: string}>
  extends Mongo.Collection<T> {
  public name: string;

  public codec: t.Type<T> & ValidatableCodec

  constructor(name: string, codec: t.Type<T> & ValidatableCodec) {
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
}
