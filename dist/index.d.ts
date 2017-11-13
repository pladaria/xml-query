declare const xmlQuery: (ast: xmlQuery.XmlNode | xmlQuery.XmlNode[]) => {
    attr: (name?: string) => string | {
        [name: string]: string;
    };
    children: () => any;
    each: (fn: (v: xmlQuery.XmlNode, i: number, a: xmlQuery.XmlNode[]) => void) => void;
    eq: (index: number) => any;
    find: (sel: string) => any;
    has: (sel: string) => any;
    first: () => any;
    get: (index: number) => xmlQuery.XmlNode;
    last: () => any;
    length: number;
    map: (fn: (v: xmlQuery.XmlNode, i: number, a: xmlQuery.XmlNode[]) => any) => any[];
    prop: (name: string) => any;
    size: () => number;
    text: () => string;
    ast: xmlQuery.XmlNode | xmlQuery.XmlNode[];
};
declare namespace xmlQuery {
    interface XmlNode {
        name: string;
        type: string;
        value: string;
        parent: XmlNode;
        attributes: {
            [name: string]: string;
        };
        children: XmlNode[];
    }
}
export = xmlQuery;
