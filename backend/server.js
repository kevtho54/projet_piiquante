require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

//mongo
require("./mongo");

// Users
const { createUsers } = require("./users");

//middleware
app.use(cors());
app.use(express.json());

//routes
app.post("/api/auth/signup", createUsers);
// app.post("/api/auth/login", (req, res) => {
//   console.log(req.body);
//   res.send(req.body);
// });
app.get("/", (req, res) => res.send("hello " + req.query.name)); // permet d'affiché dans le navigateur
// console.log(req.query); // Permet de recupéré les params de l'url et les affiché dans la console
app.listen(port, () => console.log("server listening on port" + port));
