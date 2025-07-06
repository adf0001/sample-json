const path = require("path");
const fs = require("fs");

const { sampleJson } = require("./index");

const { version, description } = require("./package.json");

let inputFile = null;
let outputFile = null;
let prefixType = false;
let verbose = 1;

// console.log(process.argv);

for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "-i") {
    inputFile = process.argv[i + 1];
    i++;
  } else if (arg === "-o") {
    outputFile = process.argv[i + 1];
    i++;
  } else if (arg === "--prefix-type") {
    prefixType = true;
  } else if (arg === "--verbose") {
    verbose = parseInt(process.argv[i + 1]);

    if (verbose >= 1) verbose = 1;
    else if (verbose <= 0) verbose = 0;
    else verbose = 1;

    i++;
  }
}

const help = `sample-json v${version}

${description}

Usage: sample-json [ -i <input-file> ] [ -o <output-file> ] [ --prefix-type ]

Options:
  -i <input-file>               Input file; if not specified, read from pipe/redirection.
  -o <output-file>              Optional, output file (default: stdout).
  --prefix-type                 Optional, stringify the value to "type: value".
                                  when type string and value string are different.
  --verbose <0|1>               Optional, 0: silent, 1: default.
`;

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = "";

    process.stdin.on("readable", () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        input += chunk;
      }
    });

    process.stdin.on("end", () => {
      resolve(input.trim());
    });

    process.stdin.on("error", (err) => {
      reject(err);
    });
  });
}

async function mainProcess() {
  let inputJson = null;
  if (inputFile) {
    // load input file
    inputFile = path.resolve(inputFile);
    if (verbose > 0) {
      console.log(`Loading input file: ${inputFile}`);
    }

    inputJson = require(inputFile);
  } else if (!process.stdin.isTTY) {
    // read input from pipe
    //let pipeText = fs.readFileSync(0, "utf8");  // cause EOF error in windows
    let pipeText = await readStdin();

    inputJson = JSON.parse(pipeText);
  } else {
    console.log(help);
    process.exit(0);
  }

  // sample json
  let outputJson = sampleJson(inputJson, { prefixType });

  let outputText = JSON.stringify(outputJson, null, 2);

  // write output file
  if (outputFile) {
    outputFile = path.resolve(outputFile);
    let dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (verbose > 0) {
      console.log(`Writing output file: ${outputFile}`);
    }
    fs.writeFileSync(outputFile, outputText, "utf8");
  } else {
    console.log(outputText);
    // process.stdout.write(outputText);
  }
}

mainProcess();
