require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = 3000;

//mongo
require("./mongo");

// Users
const { createUsers, loginUsers } = require("./usersController");

// token -  authentification de l'utilisateur
const { userControleur } = require("./token");

// sauces
const {
  getSauce,
  createSauce,
  sauceId,
  deleteSauceId,
  modifySauce,
  likeDislike,
} = require("./sauces");

//middleware
app.use(cors());
app.use(express.json());
const { upload } = require("./multer");
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Erreur interne du serveur" });
});
//routes
app.post("/api/auth/signup", createUsers);
app.post("/api/auth/login", loginUsers);
app.get("/api/sauces", userControleur, getSauce);
app.post("/api/sauces", userControleur, upload.single("image"), createSauce);
app.get("/api/sauces/:id", userControleur, sauceId);
app.delete("/api/sauces/:id", userControleur, deleteSauceId);
app.put("/api/sauces/:id", userControleur, upload.single("image"), modifySauce);
app.post("/api/sauces/:id/like/", userControleur, likeDislike);

app.get("/", (req, res) => res.send("hello " + req.query.name)); // permet d'affiché dans le navigateur
// console.log(req.query); // Permet de recupéré les params de l'url et les affiché dans la console

app.use("/images", express.static(path.join(__dirname, "images"))); //ont crée le chemain absolu pour l'imageUrl afin que celle ci s'affiche sur le site web. Je le met a la fin du docmument car c'est conseillé par la doc
app.listen(port, () => console.log("server listening on port" + port));
