import t from 'io-ts';

function brandedId<
  Name extends string,
  Brand extends { readonly [K in Name]: symbol; },
>(
  name: Name,
): t.BrandC<t.StringC, Brand> {
  return t.brand(
    t.string,
    (id): id is t.Branded<string, Brand> => !!id,
    name,
  );
}
export default brandedId;
