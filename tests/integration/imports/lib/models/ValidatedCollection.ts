import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import t from 'io-ts';
import { date } from 'io-ts-types/lib/date';
import ValidatedCollection from '../../../../../imports/lib/models/ValidatedCollection';
import AutoValueType from '../../../../../imports/lib/schemas/AutoValueType';
import autoValueId from '../../../../../imports/lib/schemas/autoValueId';
import brandedId from '../../../../../imports/lib/schemas/brandedId';

const TestSchema = t.intersection([
  t.type({
    _id: autoValueId('test', brandedId('TestSchemaId')),
    name: t.string,
    deleted: new AutoValueType('Deleted', t.boolean, true, () => false),
    createdAt: new AutoValueType('CreatedAt', date, false, () => new Date()),
  }),
  t.partial({
    updatedAt: new AutoValueType('UpdatedAt', date, false, undefined, () => new Date()),
  }),
]);

const TestModel = new ValidatedCollection('validated_collection_test', TestSchema);

describe('ValidatedCollection', function () {
  before(async function () {
    resetDatabase();
    await TestModel.updateSchema();
  });

  describe('#updateSchema', function () {
    it('can update the schema if it is already set', async function () {
      await TestModel.updateSchema();
    });

    it('accepts well-formed input', function () {
      TestModel.insert({ name: 'test' });
    });

    it('rejects fields of the wrong type', function () {
      assert.throws(function () {
        TestModel.insert({ name: 4 } as any);
      });
    });
  });

  describe('#findOne', function () {
    it('supports projections', function () {
      const id = TestModel.insert({ name: 'test' });
      const obj = TestModel.findOne(id, { fields: { name: 1, createdAt: 1 } });
      assert.hasAllKeys(obj, ['_id', 'name', 'createdAt']);
    });
  });

  describe('#insert', function () {
    it('auto-populates AutoValueType fields', function () {
      const id = TestModel.insert({ name: 'test' });
      const obj = TestModel.findOne(id)!;
      assert.isNotNull(obj);
      assert.match(obj._id, /^test_/);
      assert.isFalse(obj.deleted);
      assert.instanceOf(obj.createdAt, Date);
      assert.notExists(obj.updatedAt);
    });

    it('does not clobber non-AutoValueType fields', function () {
      const id = TestModel.insert({ name: 'test' });
      const obj = TestModel.findOne(id)!;
      assert.isNotNull(obj);
      assert.equal(obj.name, 'test');
    });
  });

  describe('#update', function () {
    it('auto-populates update-time AutoValueType fields', function () {
      const id = TestModel.insert({ name: 'test' });
      TestModel.update(id, { $set: { name: 'test 2' } });
      const obj = TestModel.findOne(id)!;
      assert.isNotNull(obj);
      assert.instanceOf(obj.updatedAt, Date);
    });
  });
});
