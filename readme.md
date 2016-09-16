# VAMTIGER CSV to Generator
This defines a class for conveniently referencing CSV data as a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

## Installation
VAMTIGER Argv can be installed using **npm**:
```bash
npm install --save vamtiger-csv-to-generator
```

## CSV Data
```
Column Tile 1; Column Title 2
Column 1 Row 2; Column 2 Row 1
```

## Usage
CSV data can be referenced via a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) **_getData_** _method_.
```javascript
const path = require('path'),
    expect = require('chai').expect,
    VamtigerCsv = require('../index.js'),
    vamtigerCsv = new VamtigerCsv({
        filePath: path.join(__dirname, 'data.csv'),
        separator: ';'
    });

// Get CSV data as a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).
vamtigerCsv.getData
    .then(data => {
        const firstRow = data.next().value; // ["Column Tile 1","Column Title 2"]

        const secondRow = data.next().value; // {"Column Tile 1":"Column 1 Row 2","Column Title 2":"Column 2 Row 1"}

        data.next().value // undefined
    });
```
