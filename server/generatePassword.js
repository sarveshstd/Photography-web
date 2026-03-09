const bcrypt = require("bcryptjs");

const password = "orlia2k26";

// Generate bcrypt hash with default salt rounds (10)
const hash = bcrypt.hashSync(password, 10);

console.log("Generated bcrypt hash for password 'orlia2k26':");
console.log(hash);

// Also output just the hash for easy copying
console.log("\n--- Copy this hash for MongoDB ---");
console.log(hash);

