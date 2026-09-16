const validator = require("validator");

const loginValidator = (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }


  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong (include upper, lower, number, symbol)");
  }
};

const profileValidates = (reqOrBody) => {
  const allowedFields = ["firstName", "lastName", "age", "photoUrl"];
  const data = (reqOrBody && reqOrBody.body) ? reqOrBody.body : reqOrBody;
  if (!data || typeof data !== "object") return false;
  const keys = Object.keys(data);
  if (keys.length === 0) return false;
  return keys.every((field) => allowedFields.includes(field));
};



module.exports = { loginValidator, profileValidates };
