const Database = require('./Database');
const database = new Database();

class Table {
    constructor(name) {
        this.tableName = name;
    }

    addEntry(entry) {
        return database.insert(this.tableName, entry);
    }

    getEntry(id) {
        return database.select(this.tableName, `id=${id}`);
    }

    getEntries(conditions = "*" || ["*"]) {
        if(conditions === "*") return database.select(this.tableName);
        return database.select(this.tableName, conditions);
    }

    updateEntry(id, updates) {
        const updateArray = [];
        for(let key in updates) {
            updateArray.push(`${key}=${updates[key]}`);
        }

        return database.update(this.tableName, `id=${id}`, updateArray);
    }

    removeEntry(id) {
        return database.delete(this.tableName, `id=${id}`);
    }
}

module.exports = Table;