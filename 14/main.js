const fs = require("fs");

/**
 * Parses a file and returns the formulas
 * @param {*} filePath The file path
 */
function parseFile(filePath) {
    const inputFile = fs.readFileSync(filePath, "utf8");
    formulas = {};

    const lines = inputFile.split("\n");
    for (line of lines) {
        const formula = parseFormulaFromLine(line);
        const id = formula.rhs.id;
        if (!(id in formulas)) {
            formulas[id] = []
        }
        formulas[id].push(formula);
    }
    return formulas;
}

/**
 * Parse function used to extract a formula
 * @param {*} line The line to be parsed, should be a string
 */
function parseFormulaFromLine(line) {
    const formula = {
        "rhs": {
            "amount": 0,
            "id": ""
        },
        "lhs": []
    }
    let tokens = line.split("=>");
    const lhs = tokens[0].trim();
    const rhs = tokens[1].trim();

    tokens = lhs.split(",");
    for (token of tokens) {
        token = token.trim()
        const variableTokens = token.split(" ");
        formula.lhs.push(getVariableFromTokens(variableTokens));
    }

    formula.rhs = getVariableFromTokens(rhs.trim().split(" "));
    return formula;
}

/**
 * Returns a variable from a splitted token pair ["3", "ORE"] for examle
 * @param {*} tokens 
 */
function getVariableFromTokens(tokens) {
    return {
        "amount": parseInt(tokens[0].trim()),
        "id": tokens[1].trim()
    };
}

/**
 * Recursive function used to find the minimum amount of ores needed to produce the target
 * @param {*} formulas The list of formulas available, should be final
 * @param {*} targetId The target we are looking for
 * @param {*} askingQuantity The asking quantity of that target
 * @param {*} extras List of materials that have been for example left over from creation of other things
 */
function findMinimumOre(formulas, targetId, askingQuantity, extras) {
    if (!targetId in formulas) {
        throw Error("Could not find formula for target");
    }

    // Remove some asking quantity if we already have ready to be used
    let foundAlreadyProduced = 0
    if (targetId in extras) {
        foundAlreadyProduced = Math.min(askingQuantity, extras[targetId]);
        extras[targetId] -= foundAlreadyProduced;
    }
    askingQuantity -= foundAlreadyProduced;
    if (askingQuantity === 0) {
        return 0;
    }

    const routeScores = []
    const newExtras = [];
    for (route of formulas[targetId]) {
        let routeScore = 0;
        const multiplier = Math.ceil(askingQuantity / route.rhs["amount"]);
        const produced = route.rhs["amount"] * multiplier;
        for (variable of route.lhs) {
            const id = variable["id"];
            if (id === "ORE") {
                routeScore += multiplier * variable["amount"];
                continue;
            }

            routeScore += findMinimumOre(formulas, id, multiplier * variable["amount"], extras);
        }
        const extraQuantity = Math.max(0, produced - askingQuantity);
        newExtras.push(extraQuantity);
        routeScores.push(routeScore);
    }

    if (routeScores.length === 0) {
        throw Error("Zero routes in output score");
    }

    let minIx = -1;
    let min = Number.MAX_VALUE;
    for (var i = 0; i < routeScores.length; i++) {
        if (routeScores[i] < min) {
            minIx = i;
            min = routeScores[i];
        }
    }

    // If you found extras, add them
    if (!(targetId in extras)) {
        extras[targetId] = 0;
    }
    extras[targetId] += (newExtras[minIx]);

    return routeScores[minIx];
}

//================================================
// Start of program
//================================================

const runTests = false;
if (runTests) {
    console.log("======RUNNING TESTS======");
    const tests = [
        {
            "file": "example.txt",
            "ans": 13312
        },
        {
            "file": "example2.txt",
            "ans": 180697
        },
        {
            "file": "example3.txt",
            "ans": 2210736
        }, {
            "file": "sample.txt",
            "ans": 165
        }
    ]

    for (test of tests) {
        const formulas = parseFile(test["file"]);
        const ores = findMinimumOre(formulas, "FUEL", 1, {});
    
        if (ores === test["ans"]) {
            console.log("CORRECT:" + test["file"] + " ans => " + ores);
        } else {
            console.log("ERROR:" + test["file"] + " ans => " + ores + " should be => " + test["ans"]);
        }
    }
} else {
    const formulas = parseFile("input.txt");
    const ores = findMinimumOre(formulas, "FUEL", 1, {});
    console.log("ores => " + ores);
}
