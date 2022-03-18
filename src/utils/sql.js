const toSQLDatetime = (date) => new Date(date).toISOString().slice(0, 19).replace('T', ' ');

module.exports = { toSQLDatetime }