const fs = require('fs');

const data = fs.readFileSync("./data.txt", "utf8");

let sum = 0;
const tokens = data.split("\n");

for (token of tokens) {
    sum += Math.floor(token/3) - 2;
}

console.log(sum);