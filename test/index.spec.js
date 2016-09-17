'use strict';

const path = require('path'),
    expect = require('chai').expect,
    VamtigerCsv = require('../index.js');

let vamtigerCsv

describe('Vamtiger CSV to Generator', function () {
    describe('should', function () {
        beforeEach(function () {
            vamtigerCsv = new VamtigerCsv({
                filePath: path.join(__dirname, 'data.csv'),
                separator: ';'
            });
        });
        
        it('reference CSV data as a generator', function (done) {
            vamtigerCsv.getData
                .then(data => expect(/generator/i.test(data.toString())).to.equal(true))
                // expect returns a result if true.
                // NB: Explicitly envoke 'done'
                .then(() => done())
                .catch(done);
        });

        it('reference the header with the first yield', function (done) {
            const header = ["Column Tile 1","Column Title 2"];
            
            vamtigerCsv.getData
                // Deeply compare values
                .then(data => expect(data.next().value).to.eql(header))
                .then(() => done())
                .catch(done);
        });

        it('reference the next row with each subsequent yield', function (done) {
            const header = [
                "Column Tile 1",
                "Column Title 2"
                ],
                nextRow = {
                    "Column Tile 1": "Column 1 Row 2",
                    "Column Title 2": "Column 2 Row 1"
                };
            
            vamtigerCsv.getData
                .then(data => {
                    expect(data.next().value).to.eql(header);
                    expect(data.next().value).to.eql(nextRow);
                })
                .then(() => done())
                .catch(done);
        });

        it('yield nothing when all the data has been yield', function (done) {
            const header = [
                "Column Tile 1",
                "Column Title 2"
                ],
                nextRow = {
                    "Column Tile 1": "Column 1 Row 2",
                    "Column Title 2": "Column 2 Row 1"
                };
            
            vamtigerCsv.getData
                // Deeply compare values
                .then(data => {
                    expect(data.next().value).to.eql(header);
                    expect(data.next().value).to.eql(nextRow);
                    expect(data.next().done).to.be.true;
                    expect(data.next().value).to.be.undefined;
                })
                .then(() => done())
                .catch(done);
        });
    });

    describe('should resolve with an error', function () {
        beforeEach(function () {
            vamtigerCsv = new VamtigerCsv({
                filePath: path.join(__dirname, 'datas.csv'),
                separator: ';'
            });
        });
        
        it('when the CSV file does not exist', function (done) {
            const errorMessage = /^Cannot get data from the CSV file/;

            vamtigerCsv.getData
                .then(() => done(new Error(`An error was expected`)))
                .catch(error => {
                    expect(error).to.be.an('error');
                    expect(error.message).to.match(errorMessage);
                    
                    done();
                })
                .catch(done);
        });
    });     
});