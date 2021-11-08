const connection = require('./connection');

const toArray = val => (val && val !== "*" && val !== "" && !Array.isArray(val)) ? [val] : val;
const escapeValue = value => connection.escape(value);
const escapeExpression = expression => {
    const [lhs, rhs] = expression.split("=");
    return `${lhs}=${escapeValue(rhs)}`;
}

class Database {
    openConnection() {
        connection.connect();
    }

    closeConnection() {
        connection.end();
    }

    runQuery(sqlQuery) {
        // console.log(sqlQuery);
        return new Promise((reslove, reject) => {
            connection.query(sqlQuery, (err, result) => {
                if (err) return reject(err);
                reslove(JSON.parse(JSON.stringify(result)));
            });
        });
    }

    insert(table, entry = {}) {
        const keys = Object.keys(entry).join(",");
        if (!keys.length) return;
        const values = Object.values(entry).map(escapeValue).join(",");
        return this.runQuery(`INSERT INTO ${table} (${keys}) VALUES (${values});`);
    }

    select(table, rows = "*" || ["*"], columns = "*" || ["*"], options = { rowOperator: 'AND' }) {
        rows = toArray(rows);
        columns = toArray(columns);

        const SQL_Rows = rows === "*" ? "" : rows.map(escapeExpression).join(` ${options.rowOperator} `);
        const SQL_Columns = columns === "*" ? "*" : columns.join(",");

        return this.runQuery(`SELECT ${SQL_Columns} FROM ${table}${SQL_Rows === "" ? "" : " WHERE "}${SQL_Rows};`);
    }

    update(table, rows = "" || [""], columns = "" || [""], options = { rowOperator: 'AND' }) {
        if (rows === "") return;
        rows = toArray(rows);
        columns = toArray(columns);

        const SQL_Rows = rows.join(` ${options.rowOperator} `);
        const SQL_Columns = columns.map(escapeExpression).join(",");

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