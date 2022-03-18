const Database = require('./Database');
const database = new Database();

const keyValueArrayFromObject = object => {
    const array = [];
    for(let key in object) {
        if(object[key] === undefined) {
            continue;
        }
        array.push(`${key}=${object[key]}`);
    }
    return array;
}

class Table {
    constructor(name) {
        this.tableName = name;
    }
    
    addEntry(entry) {
        return database.insert(this.tableName, entry);
    }

    hasEntry(rows, options = { rowOperator: 'AND' }) {
        return database.select(this.tableName, keyValueArrayFromObject(rows), '*', options)
            .then(result => result.length > 0 ? true : false);
    }

    getEntry({ rows = {}, columns = ["*"], joins = [] } = {}) {
        return database.select(this.tableName, keyValueArrayFromObject(rows), columns, { joins }).then(result => result[0]);
    }

    getEntries({ rows = {}, columns = ["*"], joins = [], groupBy = "", orderBy = "" } = {}) {
        if(Array.isArray(rows)) return database.select(this.tableName, rows, columns, { joins, groupBy, orderBy });
        return database.select(this.tableName, keyValueArrayFromObject(rows), columns, { joins, groupBy, orderBy });
    }

    updateEntries(rows, updates) {
        return database.update(this.tableName, keyValueArrayFromObject(rows), keyValueArrayFromObject(updates));
    }

    removeEntries(rows) {
        if(Array.isArray(rows)) return database.delete(this.tableName, rows);
        return database.delete(this.tableName, keyValueArrayFromObject(rows));
    }
}

module.exports = Table;