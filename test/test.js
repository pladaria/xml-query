const test = require('tape');
const xmlReader = require('xml-reader');
const xQuery = require('..');

const xmlMessage1 =
`<message id="1001" type="letter">
    <to>Alice</to>
    <from>Bob</from>
    <subject>Hello</subject>
    <body>This is a demo!</body>
</message>`;

const xmlMessage2 =
`<message id="1002" type="letter">
    <to>Carl</to>
    <from>Dave</from>
    <subject>Bye</subject>
    <body>This is a test!</body>
    <attachment>
        ${xmlMessage1}
    </attachment>
</message>`;

const xmlMessages =
`<collection>
    ${xmlMessage1}
    ${xmlMessage2}
</collection>`;

test('constructor from ast', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        t.equal(xq.length, 1, 'length is 1');
        t.equal(xq.get(0), ast, 'item 0 is the same ast');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test('constructor from ast array', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery([ast, ast]);
        t.equal(xq.length, 2, 'length is 2');
        t.equal(xq.get(0), ast, 'item 0 is ok');
        t.equal(xq.get(1), ast, 'item 1 is ok');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test('constructor from falsy values', t => {
    const values = [null, false, undefined, 0, [], ''];
    values.forEach(value => {
        const xq = xQuery(value);
        t.equal(xq.length, 0, 'length is 0');
        t.equal(xq.get(0), undefined, 'item 0 is undefined');
    });
    t.end();
});

test('find root element', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        const result = xq.find('message');
        t.equal(result.length, 1, 'one element found');
        t.equal(result.get(0).name, 'message', 'element name is message');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test('find root elements from array', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery([ast, ast]);
        const result = xq.find('message');
        t.equal(result.length, 2, 'two elements found');
        t.equal(result.get(0).name, 'message', 'element #0 name is message');
        t.equal(result.get(1).name, 'message', 'element #1 name is message');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test('find deep', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        const result = xq.find('to');
        t.equal(result.length, 3, 'three elements found');
        t.equal(result.get(0).children[0].value, 'Alice');
        t.equal(result.get(1).children[0].value, 'Carl');
        t.equal(result.get(2).children[0].value, 'Alice');
        t.end();
    });
    reader.parse(xmlMessages);
});

test('attr', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {

        t.test('attr from ast - get all', t => {
            const result = xQuery(ast).find('message').attr();
            t.deepEqual(result, {id: '1001', type: 'letter'}, 'got all attributes');
            t.end();
        });

        t.test('attr from ast - get by name', t => {
            const attr1 = xQuery(ast).find('message').attr('id');
            const attr2 = xQuery(ast).find('message').attr('type');
            t.equal(attr1, '1001', 'attr value is correct');
            t.equal(attr2, 'letter', 'attr value is correct');
            t.end();
        });

        t.test('attr from ast - get by name miss', t => {
            const result = xQuery(ast).find('message').attr('miss');
            t.equal(result, undefined, 'returns undefined');
            t.end();
        });

        t.test('attr from ast array - get all', t => {
            const result = xQuery([ast, ast]).find('message').attr();
            t.deepEqual(result, {id: '1001', type: 'letter'}, 'got all attributes');
            t.end();
        });

        t.test('attr from ast array - get by name', t => {
            const attr1 = xQuery(ast).find('message').attr('id');
            const attr2 = xQuery(ast).find('message').attr('type');
            t.equal(attr1, '1001', 'attr value is correct');
            t.equal(attr2, 'letter', 'attr value is correct');
            t.end();
        });

        t.test('attr from empty array - get all', t => {
            const result = xQuery([]).attr();
            t.deepEqual(result, undefined, 'returns undefined');
            t.end();
        });

        t.test('attr from empty array - get by name', t => {
            const result = xQuery([]).attr('miss');
            t.deepEqual(result, undefined, 'returns undefined');
            t.end();
        });

        t.end();
    });
    reader.parse(xmlMessage1);
});

test('children', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast).children();
        t.equal(xq.length, 4, 'length is 4');
        t.deepEqual(xq.map(node => node.name), ['to', 'from', 'subject', 'body'], 'children names ok');
        t.end();
    });
    reader.parse(xmlMessage1);
});
