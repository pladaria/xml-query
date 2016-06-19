const flatMap = (arr: any[], fn: (v: any, i: number, a: any[]) => any) => [].concat(...arr.map(fn));

interface XmlNode {
    name: string;
    type: string;
    value: string;
    parent: XmlNode;
    attributes: {[name: string]: string};
    children: XmlNode[];
}

interface XmlQuery {
    attr: Function;
    children: Function;
    each: Function;
    eq: Function;
    find: Function;
    first: Function;
    get: Function;
    last: Function;
    length: Function;
    map: Function;
    prop: Function;
    size: Function;
}

/**
 * @param {XmlNode|XmlNode[]} ast - Single XmlNode or array of XmlNodes
 * @return {XmlQuery}
 */
const xmlQuery = (ast: XmlNode|XmlNode[]) => {

    const nodes = Array.isArray(ast) ? ast : (ast ? [ast] : []);
    const length = nodes.length;

    /**
     * Retrieve one of the elements
     */
    const get = (index: number) => nodes[index];

    /**
     * Recursively find by name starting in the provided node
     */
    const findInNode = (node: XmlNode, sel: string) => {
        const res = (node.name === sel) ? [node] : [];
        return res.concat(flatMap(node.children, (node) => findInNode(node, sel)));
    };

    /**
     * Find by name. Including top level nodes and all its children.
     */
    const find = (sel: string) =>
        xmlQuery(flatMap(nodes, (node) => findInNode(node, sel)));

    /**
     * Returns a new xmlQuery object containing the children of the top level elements
     */
    const children = () =>
        xmlQuery(flatMap(nodes, (node) => node.children));

    /**
     * Get all attributes. If a name is provided, it returns the value for that key
     */
    const attr = (name?: string) => {
        if (length) {
            const attrs = nodes[0].attributes;
            return name ? attrs[name] : attrs;
        }
    };

    /**
     * Returns a new XmlQuery for the selected element by index
     */
    const eq = (index: number) => xmlQuery(nodes[index]);

    /**
     * Returns a new XmlQuery for the first element
     */
    const first = () => eq(0);

    /**
     * Returns a new XmlQuery for the last element
     */
    const last = () => eq(length - 1);

    /**
     * Iterate over a xmlQuery object, executing a function for each element. Returns the results in an array.
     */
    const map = (fn: (v: XmlNode, i: number, a: XmlNode[]) => any) => nodes.map(fn);

    /**
     * Iterate over a xmlQuery object, executing a function for each element
     */
    const each = (fn: (v: XmlNode, i: number, a: XmlNode[]) => void) => nodes.forEach(fn);

    /**
     * Get length
     */
    const size = () => length;

    /**
     * Get the value of a property for the first element in the set
     */
    const prop = (name?: string) => {
        const node = first();
        if (node) {
            return node[name];
        }
    };

    return {
        attr,
        children,
        each,
        eq,
        find,
        first,
        get,
        last,
        length,
        map,
        prop,
        size,
    };
};

export = xmlQuery;
