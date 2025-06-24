require("dotenv").config();
var { Sequelize } = require("sequelize");
var db = new Sequelize(
    'techrover',
    'postgres',
    'root',
    // process.env.PG_NAME,
    // process.env.PG_USER,
    // process.env.PG_PASSWORD,

    {
        dialect: "postgres",
        host: process.env.PG_HOST,
    }
);

db.sync().then(() => {
    console.log(`Database connected to discover`)
}).catch((err) => {
    console.log(err)
})
// db.sync()
module.exports = db;