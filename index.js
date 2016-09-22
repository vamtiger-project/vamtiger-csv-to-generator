'use strict';

const fs = require('fs'),
    path = require('path'),
    through = require('through2'),
    split = require('split'),
    beautify = require('js-beautify');

class VamtigerCsv {
    constructor(params) {
        this.params = params;

        this._csvPath = this.__csvPath;
        this._generatorPath = this.__generatorPath;
        this._separator = this.__separator;
        this._jsFormater = beautify.js_beautify;
    }

    get __csvPath() {
        let filePath = null;

        if (this.params.filePath)
            filePath = this.params.filePath;

        return filePath;
    }

    get __generatorPath() {
        const generatorPath = path.join(
            path.dirname(this._csvPath), 
            `${path.basename(this._csvPath).replace(/.csv$/, '')}Generator.js`
        );

        return generatorPath;
    }

    get __separator() {
        let separator = null;

        if (this.params.separator)
            separator = new RegExp(this.params.separator);

        return separator;
    }

    get _readCsv() {
        const readStream = fs.createReadStream(this._csvPath);

        return readStream;
    }

    get _splitStream() {
        const splitStream = split();
        
        return splitStream;
    }

    get _csvParseStream() {
        const csvData = {
                header: null,
                body: []
            },
            csvParseStream = through(
                (buffer, encoding, next) => this._parseCsv(buffer, encoding, next, csvData),
                done => this._parseCsvComplete(csvParseStream, done, csvData)
            );

        return csvParseStream;
    }

    _parseCsv(buffer, encoding, next, csvData) {
        const line = buffer.toString().split(this._separator),
            row = {};
        
        if (!csvData.header)
            csvData.header = line.map(header => header.trim());
        else {
            line.reduce((row, cell, index) => {
                row[csvData.header[index]] = cell.trim();

                return row;
            }, row);

            csvData.body.push(row);
        }
        
        next();
    }

    _parseCsvComplete(csvParseStream, done, csvData) {
        const generatorCode = this._formatJs(`
            "use strict";

            /**
             * Auto-generated
             **/

            module.exports = function *() {
                // Header Row
                yield ${JSON.stringify(csvData.header)};

                // Body Rows
                ${this._yieldRowsCode(csvData.body)}
            };
        `);

        csvParseStream.push(generatorCode);
        done();
    }

    get _writeGenerator() {
        const writeStream = fs.createWriteStream(this._generatorPath);

        return writeStream;
    }

    get _csvFileExists() {
        return new Promise((resolve, reject) =>
            fs.exists(this._csvPath, exists => {
                if (exists)
                    resolve();
                else
                    reject(new Error(`Cannot get data from the CSV file.
                        Reason: The CSV file does not exist.
                        Invalid Path: ${this._csvPath}
                    `));
            })
        );
    }

    get _convertCsvToGenerator () {
        return new Promise((resolve, reject) =>
            this._readCsv
                .pipe(this._splitStream)
                .pipe(this._csvParseStream)
                .pipe(this._writeGenerator)
                .on('finish', () => resolve())
                .on('error', error => reject(error))
        );
    }

    _yieldRowsCode(rows) {
        const yieldRowsCode = rows.reduce((yieldCode, row) => {
            const yieldRowCode = `
                yield ${JSON.stringify(row)};
            `.replace(/^\n/, '');

            yieldCode += yieldRowCode;

            return yieldCode;
        }, '');

        return yieldRowsCode;
    }

    _formatJs(code) {
        const formattedCode = this._jsFormater(code, {"indent_size": 4});

        return formattedCode;
    }

    get _generator() {
        const generator = require(this._generatorPath);

        return generator();
    }

    get getData() {
        return new Promise((resolve, reject) => {
            this._csvFileExists
                .then(() => this._convertCsvToGenerator)
                .then(() => this._generator)
                .then(resolve)
                .catch(reject);
        });
    }
}

module.exports = VamtigerCsv;