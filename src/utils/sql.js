const { Temporal } = require('@js-temporal/polyfill');

const toSQLDatetime = (date) => Temporal.Instant.from(date).toString().slice(0, 19).replace('T', ' ');

module.exports = { toSQLDatetime }