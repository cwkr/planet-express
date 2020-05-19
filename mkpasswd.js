const bcrypt = require('bcrypt');

if (process.argv.length < 3) {
    console.error('Missing parameter!');
    process.exit(1);
}

const salt = bcrypt.genSaltSync(10);

console.log(bcrypt.hashSync(process.argv[2], salt));
