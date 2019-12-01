const fs = require('fs');

const data = fs.readFileSync("./data.txt", "utf8");

let sum = 0;
const tokens = data.split("\n");

function fuelRec(value) {
    if (value <= 0) {
        return 0;
    }

    const fuelData =  Math.max(Math.floor(value/3) - 2, 0);
    return fuelData + fuelRec(fuelData)
}

for (token of tokens) {
    sum += fuelRec(token);
}

console.log(sum);