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

const profileValidates = (req) => {
  const allowedFields = ["firstName", "lastName", "age", "photoUrl"];
   
  const isValidKeys = Object.keys(req).every((fileld)=>
allowedFields.includes(fileld)
)
 

  return isValidKeys;
};



module.exports = { loginValidator, profileValidates };
