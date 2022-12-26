const mongoose = require("mongoose");
const login = process.env.LOGINMONGO;
const password = process.env.MDPMONGO;

mongoose
  .connect(
    `mongodb+srv://${login}:${password}@cluster0.e2lbmjg.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("connexion à mongoDB réussie")) // affiche ce message dans la console si la connexion est reussi
  .catch((err) => console.error("connexion a mongoDB échoué", err)); // affiche ce message dans la console si la connexion a échoué

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

module.exports = { mongoose, User };
