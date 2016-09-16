'use strict';

const fs = require('fs'),
    path = require('path'),
    through = require('through2'),
    split = require('split');

class VamtigerCsv {
    constructor(params) {
        this.params = params;

        this._csvPath = this.__csvPath;
        this._generatorPath = this.__generatorPath;
        this._separator = this.__separator;
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

    get _processFile () {
        return new Promise((resolve, reject) => {
            const csvData = {
                    header: null,
                    body: []
                },
                csvToJson = (buffer, encoding, next) => {
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
                },

                endCsvToJson = done => {
                    let generatorCode = `
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
                    `.replace(/^\s+/gm, '');

                    csvToJsonStream.push(generatorCode);
                    resolve(require(this._generatorPath));
                    done();
                },
                csvToJsonStream = through(csvToJson, endCsvToJson);
            
            fs.createReadStream(this._csvPath)
                .pipe(split())
                .pipe(csvToJsonStream)
                .pipe(fs.createWriteStream(this._generatorPath));
        });
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

    get getData() {
        return new Promise((resolve, reject) => 
            this._processFile
                .then(dataGenerator => resolve(dataGenerator()))
                .catch(reject)
        );
    }
}

module.exports = VamtigerCsv;