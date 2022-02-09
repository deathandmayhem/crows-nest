type PrefixedString<Suffix extends string, Prefix extends string | undefined = undefined> =
    Prefix extends undefined ?
        Suffix :
        `${Prefix}.${Suffix}`;
export default PrefixedString;
