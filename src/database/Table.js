const Database = require('./Database');
const database = new Database();

const keyValueArrayFromObject = object => {
    const array = [];
    for(let key in object) {
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

    hasEntry(conditions) {
        return database.select(this.tableName, keyValueArrayFromObject(conditions))
            .then(result => result.length > 0 ? true : false);
    }

    getEntry(conditions) {
        return database.select(this.tableName, keyValueArrayFromObject(conditions)).then(result => result[0]);
    }

    getEntries(conditions) {
        if(!conditions) return database.select(this.tableName);
        return database.select(this.tableName, keyValueArrayFromObject(conditions));
    }

    updateEntry(conditions, updates) {
        return database.update(this.tableName, keyValueArrayFromObject(conditions), keyValueArrayFromObject(updates));
    }

    removeEntry(conditions) {
        return database.delete(this.tableName, keyValueArrayFromObject(conditions));
    }
}

module.exports = Table;