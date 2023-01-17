const jwt = require("jsonwebtoken");

/**
 * Vérifie l'authentification d'un utilisateur en récupérant le jeton d'authentification dans l'en-tête "Authorization" de la requête.
 * @function userControleur
 * @param {Object} req - L'objet de la requête contenant les informations de la requête HTTP
 * @param {Object} res - L'objet de la réponse contenant les informations de la réponse HTTP
 * @param {function} next - La fonction suivante à exécuter dans le flux de traitement de la requête
 * @throws {Error} Lorsque le jeton est nul
 * @throws {Error} Lorsque le jeton n'est pas valide
 * @returns {undefined} - la fonction de retourne rien
 */

function userControleur(req, res, next) {
  const header = req.header("Authorization"); // récuperation du header dans "authorization" situé da la console
  if (header == null) return res.status(403).send({ message: "Invalid" }); // si le header est nul, affiche un message invalide

  const token = header.split(" ")[1]; // dans "authorization" je n'ai besoin que du token, j'utilise "split (" ")[1]" pour ne selectionné que le token
  if (token == null)
    return res.status(403).send({ message: "Le jeton ne peux pas être nul" }); // Si le token est nul, affiche le status 403

  jwt.verify(token, process.env.TOKEN_PASSWORD, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Token invalide " + err });
    console.log("Le token est bien valide");
    next();
  }); // J'utilise  jwt.verify pour verifier que le token sois bien valide Si il est valide, un message dans la console sinon un status 403 avec un message d'erreur
}

module.exports = { userControleur };
