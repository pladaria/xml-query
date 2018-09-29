"use strict";
var flatMap = function (arr, fn) {
    return Array.prototype.concat.apply([], arr.map(fn));
};
var xmlQuery = function (ast) {
    var nodes = Array.isArray(ast) ? ast : (ast ? [ast] : []);
    var length = nodes.length;
    var get = function (index) { return nodes[index]; };
    var children = function () {
        return xmlQuery(flatMap(nodes, function (node) { return node.children; }));
    };
    var findInNode = function (node, sel) {
        var res = (node.name === sel) ? [node] : [];
        return res.concat(flatMap(node.children, function (node) { return findInNode(node, sel); }));
    };
    var find = function (sel) {
        return xmlQuery(flatMap(nodes, function (node) { return findInNode(node, sel); }));
    };
    var has = function (sel) {
        if (nodes.length === 0) {
            return false;
        }
        if (nodes.some(function (node) { return node.name === sel; })) {
            return true;
        }
        return children().has(sel);
    };
    var attr = function (name) {
        if (length) {
            var attrs = nodes[0].attributes;
            return name ? attrs[name] : attrs;
        }
    };
    var eq = function (index) { return xmlQuery(nodes[index]); };
    var first = function () { return eq(0); };
    var last = function () { return eq(length - 1); };
    var map = function (fn) { return nodes.map(fn); };
    var each = function (fn) { return nodes.forEach(fn); };
    var size = function () { return length; };
    var prop = function (name) {
        var node = get(0);
        if (node) {
            return node[name];
        }
    };
    var text = function () {
        var res = '';
        each(function (node) {
            if (node.type === 'text') {
                res += node.value;
            }
            else {
                res += xmlQuery(node).children().text();
            }
        });
        return res;
    };
    return {
        attr: attr,
        children: children,
        each: each,
        eq: eq,
        find: find,
        has: has,
        first: first,
        get: get,
        last: last,
        length: length,
        map: map,
        prop: prop,
        size: size,
        text: text,
        ast: ast,
    };
};
module.exports = xmlQuery;
