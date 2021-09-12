/*!
 * XML-Query
 * Copyright (c) 2016 Pedro Ladaria
 * https://github.com/pladaria/xml-query
 * MIT Licensed
 */
const flatMap = (arr: any[], fn: (v: any, i: number, a: any[]) => any) =>
    Array.prototype.concat.apply([], arr.map(fn));

const xmlQuery = (ast: xmlQuery.XmlNode | xmlQuery.XmlNode[]) => {

    const nodes = Array.isArray(ast) ? ast : (ast ? [ast] : []);
    const length = nodes.length;

    /**
     * Retrieve one of the elements
     */
    const get = (index: number) => nodes[index];

    /**
     * Returns a new xmlQuery object containing the children of the top level elements
     */
    const children = () =>
        xmlQuery(flatMap(nodes, (node) => node.children));

    /**
     * Recursively find by name starting in the provided node
     */
    const findInNode = (node: xmlQuery.XmlNode, sel: string, attr: { [name: string]: string }) => {
        const reducer = (acc, key) => acc && (attr[key] === node.attributes[key]);
        const res = (node.name === sel && Object.keys(attr).reduce(reducer, true)) ? [node] : [];
        return res.concat(flatMap(node.children, (node) => findInNode(node, sel, attr)));
    };

    /**
     * Find by name. Including top level nodes and all its children.
     */
    const find = (sel: string, attr: { [name: string]: string } = {}) =>
        xmlQuery(flatMap(nodes, (node) => findInNode(node, sel, attr)));

    /**
     * Returns true if it has the given element. Faster than find because it stops on first occurence.
     */
    const has = (sel: string) => {
        if (nodes.length === 0) {
            return false;
        }
        if (nodes.some((node) => node.name === sel)) {
            return true;
        }
        return children().has(sel);
    }

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
     * Returns a new XmlQuery object for the selected element by index
     */
    const eq = (index: number) => xmlQuery(nodes[index]);

    /**
     * Returns a new XmlQuery object for the first element
     */
    const first = () => eq(0);

    /**
     * Returns a new XmlQuery object for the last element
     */
    const last = () => eq(length - 1);

    /**
     * Iterate over a xmlQuery object, executing a function for each element. Returns the results in an array.
     */
    const map = (fn: (v: xmlQuery.XmlNode, i: number, a: xmlQuery.XmlNode[]) => any) => nodes.map(fn);

    /**
     * Iterate over a xmlQuery object, executing a function for each element
     */
    const each = (fn: (v: xmlQuery.XmlNode, i: number, a: xmlQuery.XmlNode[]) => void) => nodes.forEach(fn);

    /**
     * Get length
     */
    const size = () => length;

    /**
     * Get the value of a property for the first element in the set
     */
    const prop = (name: string) => {
        const node = get(0);
        if (node) {
            return node[name];
        }
    };

    /**
     * Get the combined text contents of each element, including their descendants
     */
    const text = () => {
        let res = '';
        each(node => {
            if (node.type === 'text') {
                res += node.value;
            } else {
                res += xmlQuery(node).children().text();
            }
        });
        return res;
    };

    return {
        attr,
        children,
        each,
        eq,
        find,
        has,
        first,
        get,
        last,
        length,
        map,
        prop,
        size,
        text,
        ast,
    };
};

namespace xmlQuery {

    export interface XmlNode {
        name: string;
        type: string;
        value: string;
        parent: XmlNode;
        attributes: { [name: string]: string };
        children: XmlNode[];
    }
}

export = xmlQuery;
