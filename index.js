// interface XmlNode {
//     name: string; // element name (empty for text nodes)
//     type: string; // node type (element or text), see NodeType constants
//     value: string; // value of a text node
//     parent: XmlNode; // reference to parent node (null in root node)
//     attributes: {[name: string]: string}; // map of attributes name => value
//     children: XmlNode[];  // array of children nodes
// }

const flatMap = (arr, fn) => [].concat(...arr.map(fn));

const xmlQuery = (ast) => {

    const nodes = Array.isArray(ast) ? ast : [ast];
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
        if (!length) {
            return;
        }
        const attrs = nodes[0].attributes
        return name ? attrs[name] : attrs;
    };

    const eq = (n) => xmlQuery(nodes[n]);
    const first = () => eq(0);
    const last = () => eq(length - 1);
    const map = (fn) => nodes.map(fn);
    const size = () => length;

    // @todo
    // .prop()
    // .each()

    return {
        attr,
        children,
        eq,
        find,
        first,
        get,
        length,
        map,
        size,
    };
};

module.exports = xmlQuery;