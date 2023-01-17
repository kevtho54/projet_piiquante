// j'importe les dependance
const { User } = require("./mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Crée un nouvel utilisateur en récupérant l'email et le mot de passe de la requête, en hachant le mot de passe et en enregistrant les informations dans la base de données.
 *
 * @function createUsers
 * @async
 *
 * @param {Object} req - L'objet de la requête contenant les informations de l'email et du mot de passe saisis par l'utilisateur
 * @param {Object} res - L'objet de la réponse pour envoyer des informations à l'utilisateur
 *
 * @throws {Error} Lorsque la sauvegarde de l'utilisateur échoue en raison d'un conflit avec un email déjà existant
 *
 * @returns {undefined}
 */

async function createUsers(req, res) {
  const email = req.body.email; // Je recupère le contenue écrit dans le champs "email"
  const password = req.body.password; // Je recupère le contenue écrit dans le champs " password"

  const passwordHache = await hachePassword(password); // J'appelle la fonction pour haché le password
  const user = new User({ email, password: passwordHache }); //enregistrement dans la base de donnée
  user
    .save() // sauvegarde la variable "user" dans la base de donnée
    .then(() =>
      res.status(201).send({ message: "Utilisateur enregistré avec succès !" })
    ) // status 201 pour nous dire que tout c'est bien passé
    .catch((err) =>
      res.status(409).send({ message: "Utilisateur non enregistré " + err })
    ); // status 409 si l'email ajouté est déjà dans la base de données car l'erreur 409 indique un conflit.
}

/**
 * Hache un mot de passe en utilisant bcrypt.
 * @function hachePassword
 * @param {string} password  Le mot de passe à haché
 * @returns {string} Le mot de passe haché
 */

function hachePassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds); // utilisation de bcrypt.hash pour haché le mot de passe
}

/**
 * Connecte un utilisateur en vérifiant son email et son mot de passe dans la base de données et en lui renvoyant un jeton d'authentification.
 * @function loginUsers
 * @async
 *
 * @param {Object} req - L'objet de la requête contenant les informations de l'email et du mot de passe saisis par l'utilisateur
 * @param {Object} res - L'objet de la réponse pour envoyer des informations à l'utilisateur
 *
 * @throws {Error} Lorsque l'email n'est pas enregistré dans la base de données, lorsque le mot de passe est incorrect, ou lors d'une erreur interne du serveur
 *
 * @returns {undefined}
 */

async function loginUsers(req, res) {
  try {
    const email = req.body.email; // Je recupère les données du champs "email"
    const password = req.body.password; // Je recupère les données du champs "password"

    const user = await User.findOne({ email: email }); // J'utilise "findone pour controlé l'émail dans la base de donnée"

    if (user === null) {
      return res.status(404).send({ message: "Email non enregistré" });
    } // Si il ne trouve pas l'email dans la base de données, renvois une erreur 404

    const passwordValide = await bcrypt.compare(password, user.password); // J'utilise bcrypt.compare pour comparé le mdp entrée avec l'email selectionné pour controlé que celui ci sois le bon mdp

    if (!passwordValide) {
      return res.status(401).send({ message: "mot de passe incorect" });
    } // si le mot de passe est incorrecte, erreur 401

    const token = createToken(email);
    res.status(200).send({ userId: user._id, token: token }); // si mot de passe corespondent, code 200 et j'affiche l'user id et le token dans la reponse.
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Erreur interne du serveur" }); // Si un autre problème a lieu code 500 erreur interne
  }
}

/**
 * Crée un jeton d'authentification pour un utilisateur en utilisant son adresse email et un mot de passe de jeton stocké dans les variables d'environnement.
 * @function createToken
 * @param {string} email - L'adresse email de l'utilisateur pour laquelle créer un jeton
 * @returns {string} Le jeton d'authentification créé
 */

function createToken(email) {
  const tokenPassword = process.env.TOKEN_PASSWORD; // mot de passe du token stocker dans une variable d'environement
  const token = jwt.sign({ email: email }, tokenPassword, {
    expiresIn: "1h",
  }); // signature du token + expiration du token au bout d'une heure
  return token;
}
module.exports = { createUsers, loginUsers }; // j'exporte les fonctions
