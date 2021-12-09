if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
    res.send("Moderator Bot");
});

server.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(`Moderator Bot \nPath: ${req.originalUrl}`);
    next();
});

const port = process.env.PORT || 8000;

const keepAlive = () => {
    server.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};

module.exports = keepAlive;
