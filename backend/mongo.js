const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-unique-validator");
const login = process.env.LOGINMONGO;
const password = process.env.MDPMONGO;
const nameDatabase = process.env.NAME_DATABASE;

mongoose
  .connect(
    `mongodb+srv://${login}:${password}@${nameDatabase}.e2lbmjg.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("connexion à mongoDB réussie")) // affiche ce message dans la console si la connexion est reussi
  .catch((err) => console.error("connexion a mongoDB échoué", err)); // affiche ce message dans la console si la connexion a échoué

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
userSchema.plugin(mongooseValidator, {
  message: "Error, {VALUE} déjà existant",
}); // J'utilise cette ligne de code pour affiché un message d'erreur personalisé si un utilisateur essaye de s'inscrire avec un mail déjà présent dans la base de données

const User = mongoose.model("User", userSchema); // création du nouveau model de schema

module.exports = { mongoose, User };
