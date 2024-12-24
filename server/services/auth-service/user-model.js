const db = require("../../loaders/mysql-connection");
const crypto = require("crypto");

class UserModel {
  constructor(model) {
    Object.assign(this, model);
  }

  // Şifreyi hashle
  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return { salt, hash };
  }

  // Şifreyi doğrula
  validatePassword(password) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");
    return this.password === hash;
  }

  async save() {
    await db("users")
      .update({
        username: this.username,
        email: this.email,
        password: this.password,
        salt: this.salt,
      })
      .where("id", this.id);
  }

  static async create(data) {
    const { hash, salt } = this.hashPassword(data.password); // Şifreyi hashle ve salt oluştur

    const [insertedId] = await db("users")
      .returning(["id"])
      .insert({
        ...data,
        password: hash,
        salt,
      });

    const result = await db("users")
      .select("*")
      .where("id", insertedId)
      .first();
    

    return new UserModel(result);
  }

  static async findById(id) {
    const data = await db("users").select("*").where("id", id).first();

    return data ? new UserModel(data) : null;
  }

  static async findByEmail(email) {
    const data = await db("users").select("*").where("email", email).first();

    return data ? new UserModel(data) : null;
  }

  static async find() {
    const data = await db("users").select("*")

    return data
  }
}

module.exports = UserModel;
