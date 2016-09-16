'use strict';

const path = require('path'),
    expect = require('chai').expect,
    VamtigerCsv = require('../index.js'),
    vamtigerCsv = new VamtigerCsv({
        filePath: path.join(__dirname, 'data.csv'),
        separator: ';'
    });

describe('Vamtiger CSV to Generator', function () {
    it('should be referenced as a generator', function (done) {
        vamtigerCsv.getData
            .then(data => expect(/generator/i.test(data.toString())).to.equal(true))
            // expect returns a result if true.
            // NB: Explicitly envoke 'done'
            .then(() => done())
            .catch(done);
    });

    it('should reference the header with the first yield', function (done) {
        const header = ["Column Tile 1","Column Title 2"];
        
        vamtigerCsv.getData
            // Deeply compare values
            .then(data => expect(data.next().value).to.eql(header))
            .then(() => done())
            .catch(done);
    });

    it('should reference the first body row after the header', function (done) {
        const header = [
            "Column Tile 1",
            "Column Title 2"
            ],
            firstBodyRow = {
                "Column Tile 1": "Column 1 Row 2",
                "Column Title 2": "Column 2 Row 1"
            };
        
        vamtigerCsv.getData
            .then(data => {
                expect(data.next().value).to.eql(header);
                expect(data.next().value).to.eql(firstBodyRow);
            })
            .then(() => done())
            .catch(done);
    });

    it('should yield nothing after when all the data has been yield', function (done) {
        const header = [
            "Column Tile 1",
            "Column Title 2"
            ],
            firstBodyRow = {
                "Column Tile 1": "Column 1 Row 2",
                "Column Title 2": "Column 2 Row 1"
            };
        
        vamtigerCsv.getData
            // Deeply compare values
            .then(data => {
                expect(data.next().value).to.eql(header);
                expect(data.next().value).to.eql(firstBodyRow);
                expect(data.next().value).to.eql(undefined);
            })
            .then(() => done())
            .catch(done);
    });
});