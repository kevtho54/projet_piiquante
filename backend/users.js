const { User } = require("./mongo");
const bcrypt = require("bcrypt");

async function createUsers(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const passwordHache = await hachePassword(password);

  console.log("password:", password);
  console.log("password haché:", passwordHache);

  const user = new User({ email, password: passwordHache }); //enregistrement dans la base de donnée

  user
    .save()
    .then(() => res.send({ message: "Utilisateur enregistré avec succès !" }))
    .catch((err) => console.log("Utilisateur non enregistré", err));
}

function hachePassword(password) {
  const caractere = 10;
  return bcrypt.hash(password, caractere);
}
module.exports = { createUsers };
