const test = require('ava');
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

test.cb('constructor from ast', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        t.is(xq.length, 1, 'length is 1');
        t.is(xq.get(0), ast, 'item 0 is the same ast');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('constructor from ast array', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery([ast, ast]);
        t.is(xq.length, 2, 'length is 2');
        t.is(xq.get(0), ast, 'item 0 is ok');
        t.is(xq.get(1), ast, 'item 1 is ok');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('constructor from falsy values', t => {
    const values = [null, false, undefined, 0, [], ''];
    values.forEach(value => {
        const xq = xQuery(value);
        t.is(xq.length, 0, 'length is 0');
        t.is(xq.get(0), undefined, 'item 0 is undefined');
    });
    t.end();
});

test.cb('find root element', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        const result = xq.find('message');
        t.is(result.length, 1, 'one element found');
        t.is(result.get(0).name, 'message', 'element name is message');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('find root elements from array', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery([ast, ast]);
        const result = xq.find('message');
        t.is(result.length, 2, 'two elements found');
        t.is(result.get(0).name, 'message', 'element #0 name is message');
        t.is(result.get(1).name, 'message', 'element #1 name is message');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('find deep', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast);
        const result = xq.find('to');
        t.is(result.length, 3, 'three elements found');
        t.is(result.get(0).children[0].value, 'Alice');
        t.is(result.get(1).children[0].value, 'Carl');
        t.is(result.get(2).children[0].value, 'Alice');
        t.end();
    });
    reader.parse(xmlMessages);
});

test.cb('attr', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        t.deepEqual(xQuery(ast).find('message').attr(), {id: '1001', type: 'letter'},
            'attr from ast: get all');

        t.is(xQuery(ast).find('message').attr('id'), '1001',
            'attr from ast: get by name');

        t.is(xQuery(ast).find('message').attr('type'), 'letter',
            'attr from ast: get by name');

        t.is(xQuery(ast).find('message').attr('miss'), undefined,
            'attr from ast: get by name miss');

        t.deepEqual(xQuery([ast, ast]).find('message').attr(), {id: '1001', type: 'letter'},
            'attr from ast array: get all');

        t.is(xQuery(ast).find('message').attr('id'), '1001',
            'attr from ast array: get by name');

        t.is(xQuery(ast).find('message').attr('type'), 'letter',
            'attr from ast array: get by name');

        t.deepEqual(xQuery([]).attr(), undefined,
            'attr from empty array - get all');

        t.deepEqual(xQuery([]).attr('miss'), undefined,
            'attr from empty array - get by name');

        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('children', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const xq = xQuery(ast).children();
        t.is(xq.length, 4, 'length is 4');
        t.deepEqual(xq.map(node => node.name), ['to', 'from', 'subject', 'body'], 'children names ok');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('text', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const expected = 'AliceBobHelloThis is a demo!';
        const result = xQuery(ast).text();
        t.is(result, expected, 'text is correct');
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('prop', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        t.is(xQuery(ast).prop('name'), 'message');
        t.is(xQuery(ast).prop('type'), 'element');
        t.is(xQuery(ast).prop('unknown?'), undefined);
        t.is(xQuery([]).prop('zero'), undefined);
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('eq, first, last', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        t.is(xQuery(ast).children().eq(0).prop('name'), 'to');
        t.is(xQuery(ast).children().first().prop('name'), 'to');
        t.is(xQuery(ast).children().eq(3).prop('name'), 'body');
        t.is(xQuery(ast).children().last().prop('name'), 'body');
        t.is(xQuery(ast).children().eq(10).length, 0);
        t.is(xQuery(ast).children().eq(-1).length, 0);
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('map', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        const result = xQuery(ast).children().map((node, index, array) => {
            t.deepEqual(node, array[index]);
            return node.name;
        });
        const expected = ['to', 'from', 'subject', 'body'];
        t.deepEqual(result, expected);
        t.end();
    });
    reader.parse(xmlMessage1);
});

test.cb('size, length', t => {
    const reader = xmlReader.create();
    reader.on('done', ast => {
        t.is(xQuery(ast).children().size(), 4);
        t.is(xQuery(ast).children().length, 4);
        t.end();
    });
    reader.parse(xmlMessage1);
});

test('has', t => {
    const ast = xmlReader.parseSync(xmlMessage1);
    t.is(xQuery(ast).has('body'), true);
    t.is(xQuery(ast).has('nobody'), false);
});
