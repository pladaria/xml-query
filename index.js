/**
 * @param {any[]} arr
 * @param {Function} fn
 * @return {any[]}
 */
const flatMap = (arr, fn) => [].concat(...arr.map(fn));

/**
 * @typedef {Object} XmlNode
 * @property {string} name
 * @property {string} type 'element' or 'text'
 * @property {string} value Text value for text type
 * @property {XmlNode} parent Reference to parent node
 * @property {Object} attributes Key-Value Map
 * @property {XmlNode[]} children
 */

/**
 * @typedef {Object} XmlQuery
 * @property {Function} attr
 * @property {Function} children
 * @property {Function} each
 * @property {Function} eq
 * @property {Function} find
 * @property {Function} first
 * @property {Function} get
 * @property {Function} last
 * @property {Function} length
 * @property {Function} map
 * @property {Function} size
 */

/**
 * @param {any} ast Single XmlNode or array of XmlNodes
 * @return {XmlQuery}
 */
const xmlQuery = (ast) => {

    const nodes = Array.isArray(ast) ? ast : (ast ? [ast] : []);
    const length = nodes.length;

    const get = (i) => nodes[i];

    const findInNode = (node, sel) => {
        const res = (node.name === sel) ? [node] : [];
        return res.concat(flatMap(node.children, (node) => findInNode(node, sel)));
    };

    const find = (sel) =>
        xmlQuery(flatMap(nodes, (node) => findInNode(node, sel)));

    const children = () =>
        xmlQuery(flatMap(nodes, (node) => node.children));

    const attr = (name) => {
        if (length) {
            const attrs = nodes[0].attributes;
            return name ? attrs[name] : attrs;
        }
    };

    const eq = (n) => xmlQuery(nodes[n]);
    const first = () => eq(0);
    const last = () => eq(length - 1);
    const map = (fn) => nodes.map(fn);
    const each = (fn) => nodes.forEach(fn);
    const size = () => length;

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
        size,
    };
};

module.exports = xmlQuery;
