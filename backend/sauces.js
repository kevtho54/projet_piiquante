const mongoose = require("mongoose");
const express = require("express");
const { log } = require("console");
const app = express();
const unlink = require("fs").promises.unlink; // pour crée une promesse du unlink pour gerer les cas d'erreurs de la suppression de l'image
// midleware
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Erreur interne du serveur" });
});

const productSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: Number,
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String],
});

const Product = mongoose.model("product", productSchema);

/**
 * Récupère tous les produits dans la base de données et les renvoie à l'utilisateur.
 * @function getSauce
 *
 * @param {Object} req - L'objet de la requête
 * @param {Object} res - L'objet de la réponse pour envoyer les produits à l'utilisateur
 *
 * @throws {Error} Lorsqu'une erreur se produit lors de la récupération des produits depuis la base de données
 *
 * @returns {undefined}
 */

function getSauce(req, res) {
  Product.find({}) // j'effectue une recherche dans la base de donnée
    .then((products) => res.send(products))
    .catch((error) => res.status(500).send(error));
}

/**
 * Crée un nouveau produit en récupérant les données de la requête, en les enregistrant dans la base de données et en renvoyant un message de succès à l'utilisateur.
 *
 * @function createSauce
 *
 * @param {Object} req - L'objet de la requête contenant les informations du formulaire d'ajout de sauce, ainsi que l'image
 * @param {Object} res - L'objet de la réponse pour envoyer un message de succès à l'utilisateur
 *
 * @throws {Error} Lorsque l'enregistrement de la sauce échoue en raison d'une erreur de base de données
 *
 * @returns {undefined}
 */

function createSauce(req, res) {
  const body = req.body; // recupere les données du formulaire en ajoutant une sauce
  const file = req.file; // recupère l'image du formulaire
  const fileNameImg = file.fileName;

  const sauce = JSON.parse(body.sauce); // Je parse le body pour avoir un objet lisible

  const userId = sauce.userId;
  const name = sauce.name;
  const manufacturer = sauce.manufacturer;
  const description = sauce.description;
  const mainPepper = sauce.mainPepper;
  const imageUrl = makeImgUrl(req, fileNameImg);

  const heat = sauce.heat;
  const likes = 0;
  const dislikes = 0;
  const usersLiked = [];
  const usersDisliked = [];

  const product = new Product({
    userId,
    name,
    manufacturer,
    description,
    mainPepper,
    imageUrl,
    heat,
    likes,
    dislikes,
    usersLiked,
    usersDisliked,
  });
  // Je sauvegarde les données dans la base de donnée
  product
    .save()
    .then((message) => {
      res.status(201).send({
        message: "Votre sauce a été enregistré avec succès",
        message,
      });
      return console.log("produit enregistré dans la base de données");
    })
    .catch(console.error);
}
/**
 * Génère une URL complète pour une image en utilisant les informations de la requête et le nom de fichier de l'image.
 * @function makeImgUrl
 *
 * @param {Object} req - L'objet de la requête contenant les informations de protocole et d'hôte
 * @param {string} fileNameImg - Le nom de fichier de l'image
 *
 * @returns {string} L'URL complète pour l'image
 */

function makeImgUrl(req, fileNameImg) {
  return req.protocol + "://" + req.get("host") + "/images/" + fileNameImg;
}
/**
 * Supprime un produit de la base de données en utilisant l'ID de la sauce envoyé dans l'URL, puis supprime également l'image associée.
 * @function deleteSauceId
 *
 * @param {Object} req - L'objet de la requête contenant l'ID de la sauce à supprimer
 * @param {Object} res - L'objet de la réponse pour envoyer un message de confirmation de suppression à l'utilisateur
 *
 * @throws {Error} Lorsque la suppression du produit échoue en raison d'une erreur de base de données
 *
 * @returns {undefined}
 */

function deleteSauceId(req, res) {
  const id = req.params.id; // je recup_re l'id de la sauce dans l'url
  Product.findByIdAndDelete(id) // Je supprime l'id, donc la sauce en question sur mongo
    .then((product) => responseUser(product, res))
    .then((img) => deleteImg(img))
    .then((res) => console.log("sauce supprimée", res))
    .catch((err) => res.status(500).send({ message: err }));
}
/**
 * Modifie un produit de la base de données en utilisant l'ID de la sauce envoyé dans l'URL, et éventuellement une nouvelle image.
 * @function modifySauce
 *
 * @param {Object} req - L'objet de la requête contenant l'ID de la sauce à modifier ainsi que les nouvelles données et éventuellement une nouvelle image.
 * @param {Object} res - L'objet de la réponse pour envoyer un message de confirmation de modification à l'utilisateur
 *
 * @throws {Error} Lorsque la modification du produit échoue en raison d'une erreur de base de données
 *
 * @returns {undefined}
 */

function modifySauce(req, res) {
  const id = req.params.id;

  const hasNewImage = req.file != null; // Si pendant la modification il y a l'image qui est modifier renvois "true" sinon renvois "false"
  const modify = modifyImg(hasNewImage, req);

  Product.findByIdAndUpdate(id, modify) // mise a jour de la base de donnée après modification
    .then((response) => responseUser(response, res))
    .then((product) => deleteImg(product, res))
    .catch((err) => console.error("probleme updating", err));
}

/**
 * Supprime une image à partir de l'URL de l'image du produit spécifié, et renvoie le produit sans l'image.
 * @function deleteImg
 *
 * @param {Object} product - L'objet du produit contenant l'URL de l'image à supprimer
 * @param {Object} res - L'objet de la réponse pour envoyer le produit sans l'image supprimée
 *
 * @throws {Error} Lorsque la suppression de l'image échoue en raison d'une erreur de système de fichiers
 *
 * @returns {Object} Le produit sans l'image supprimée
 */

function deleteImg(product, res) {
  if (product == null) return;
  const deleteImage = product.imageUrl.split("/").at(-1);
  return unlink("images/" + deleteImage) // Je supprime l'image du dossier  grace a image url et je fais un .then product pour afficher le product dans la reponse.Si il y a une erreur c'est le catch qui prend le dessus
    .then(() => {
      return product;
    })
    .catch((err) =>
      console.error("probleme lors de la suppression de l'image", err)
    );
}
/**
 * Modifie l'URL de l'image d'un produit si une nouvelle image est téléchargée lors de la modification.
 * @function modifyImg
 *
 * @param {Boolean} hasNewImage - Booleen qui indique si une nouvelle image a été téléchargée lors de la modification
 * @param {Object} req - L'objet de la requête contenant les données de la modification et l'image téléchargée
 *
 * @returns {Object} L'objet du produit avec la nouvelle URL de l'image si une nouvelle image a été téléchargée, ou l'objet de la requête sans modification si aucune nouvelle image n'a été téléchargée.
 */

function modifyImg(hasNewImage, req) {
  console.log("hasnewimage", hasNewImage); // Si pendant la modification il y a l'image qui est modifier renvois "true" sinon renvois "false"
  if (!hasNewImage) return req.body; // Si il n'y a pas d'image  modifier return le req.body
  const bodyObject = JSON.parse(req.body.sauce);
  bodyObject.imageUrl = makeImgUrl(req, req.file.fileName);
  return bodyObject;
}
/**
 * Envoie une réponse HTTP appropriée à l'utilisateur en fonction de la réussite ou de l'échec de la modification d'un produit.
 * @function responseUser
 *
 * @param {Object} product - L'objet produit qui a été modifié ou non
 * @param {Object} res - L'objet de la réponse HTTP
 *
 * @returns {Promise} Une promesse qui résout une réponse HTTP avec un statut 200 si la modification a réussi, ou un statut 404 si la modification a échoué.
 */

function responseUser(product, res) {
  if (product == null) {
    console.log("modification échouée"); // Si product est  null alors un message dans la console apparait avec un code d'erreur 404
    return res
      .status(404)
      .send({ message: "La sauce ne figure pas dans la base de donnée" });
  }
  // Si tout est ok ont anvois le status 200
  console.log(" Modifiaction enregistrée", product);

  return Promise.resolve(
    res.status(200).send({ message: "Mise a jour effectuée avec succès" })
  ).then(() => product);
}

/**
 *Récupère une sauce spécifique en fonction de son ID
 * @param {Object} req - Les informations de la requête
 * @param {string} req.params.id - L'ID de la sauce à récupérer
 * @param {Object} res - Les informations de la réponse
 * @return {Object} La sauce correspondant à l'ID demandé ou un message d'erreur
 */

function sauceId(req, res) {
  const id = req.params.id;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        res
          .status(404)
          .send({ message: "Sauce non trouvée dans la base de données" });
      } else {
        res.send(product);
      }
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .send({ message: "Erreur lors de la récupération de la sauce" });
    });
}

/**
 * Fonction pour aimer ou disliker une sauce en fonction de l'ID de l'utilisateur et de l'ID de la sauce.
 * @function likeDislike
 
 * @param {Object} req
 * @param {Object} res
 
 * @returns {(Object|String)} Retourne un message de succès ou un objet d'erreur si l'ID de l'utilisateur ou de la sauce n'est pas valide.
 */

function likeDislike(req, res) {
  const id = req.params.id;
  const userId = req.body.userId;
  let like = req.body.like;

  Product.findById(id, (err, sauce) => {
    if (err) return res.status(500).send(err);
    if (!sauce) return res.status(404).send({ message: "Sauce non trouvée" });

    // Vérifie si l'utilisateur a déjà aimé cette sauce
    if (like === 1) {
      if (sauce.usersLiked.includes(userId)) {
        let position = sauce.usersLiked.indexOf(userId);
        sauce.usersLiked.splice(position, 1);
        sauce.likes = sauce.usersLiked.length;
      } else {
        sauce.usersLiked.push(userId);
        sauce.likes = sauce.usersLiked.length;
      }
    } else if (like === -1) {
      if (sauce.usersDisliked.includes(userId)) {
        let position = sauce.usersDisliked.indexOf(userId);
        sauce.usersDisliked.splice(position, 1);
        sauce.dislikes = sauce.usersDisliked.length;
      } else {
        sauce.usersDisliked.push(userId);
        sauce.dislikes = sauce.usersDisliked.length;
      }
    } else if (like === 0) {
      if (sauce.usersLiked.includes(userId)) {
        let position = sauce.usersLiked.indexOf(userId);
        sauce.usersLiked.splice(position, 1);
        sauce.likes = sauce.usersLiked.length;
      }
      if (sauce.usersDisliked.includes(userId)) {
        let position = sauce.usersDisliked.indexOf(userId);
        sauce.usersDisliked.splice(position, 1);
        sauce.dislikes = sauce.usersDisliked.length;
      }
    }
    sauce
      .save()
      .then(() => {
        if (like === 1) {
          res.status(200).json({ message: "Vous avez liker cette sauce" });
        } else if (like === -1) {
          res.status(200).json({ message: "Vous avez disliker cette sauce" });
        } else {
          res.status(200).json({ message: "Annulation de votre action" });
        }
      })
      .catch((error) => res.status(400).json({ error }));
  });
}

module.exports = {
  getSauce,
  createSauce,
  sauceId,
  deleteSauceId,
  modifySauce,
  likeDislike,
};
