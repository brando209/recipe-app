const connection = require('./connection');

const toArray = val => (val && val !== "*" && val !== "" && !Array.isArray(val)) ? [val] : val;

class Database {
    constructor() {
        this.connection = connection;
    }

    openConnection() {
        this.connection.connect();
    }

    closeConnection() {
        this.connection.end();
    }

    runQuery(sqlQuery) {
        // console.log(sqlQuery);
        return new Promise((reslove, reject) => {
            this.connection.query(sqlQuery, (err, result) => {
                if (err) return reject(err);
                reslove(JSON.parse(JSON.stringify(result)));
            });
        });
    }

    insert(table, entry = {}) {
        const keys = Object.keys(entry).join(",");
        if (!keys.length) return;
        const values = Object.values(entry).map(value => this.connection.escape(value)).join(",");
        return this.runQuery(`INSERT INTO ${table} (${keys}) VALUES (${values});`);
    }

    select(table, rows = "*" || ["*"], columns = "*" || ["*"], options = { rowOperator: 'AND' }) {
        rows = toArray(rows);
        columns = toArray(columns);

        const SQL_Rows = rows === "*" ? "" : rows.join(` ${options.rowOperator} `);
        const SQL_Columns = columns === "*" ? "*" : columns.join(",");

        return this.runQuery(`SELECT ${SQL_Columns} FROM ${table}${SQL_Rows === "" ? "" : " WHERE "}${SQL_Rows};`);
    }

    update(table, rows = "" || [""], columns = "" || [""], options = { rowOperator: 'AND' }) {
        if (rows === "") return;
        rows = toArray(rows);
        columns = toArray(columns);

        const SQL_Rows = rows.join(` ${options.rowOperator} `);
        const SQL_Columns = columns.map(column => {
            const [lhs, rhs] = column.split("=");
            return `${lhs}=${this.connection.escape(rhs)}`;
        }).join(",");

        return this.runQuery(`UPDATE ${table} SET ${SQL_Columns} WHERE ${SQL_Rows};`)
    }

    delete(table, rows = "" || [""], options = { rowOperator: 'AND' }) {
        if (rows === "") return;
        rows = toArray(rows);

        const SQL_Rows = rows === "*" ? "" : rows.join(` ${options.rowOperator} `);
        return this.runQuery(`DELETE FROM ${table}${SQL_Rows === "" ? "" : ` WHERE ${SQL_Rows}`};`);
    }
}

module.exports = Database;