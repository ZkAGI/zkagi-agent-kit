const snarkjs = require("snarkjs");
const fs = require("fs");

async function proof_generator() {
    const input = JSON.parse(fs.readFileSync('src/input.json'));

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "./circuit/ExactArrayOfTokens_js/ExactArrayOfTokens.wasm",
        "./keys/ExactArrayOfTokens_final.zkey"
    );

    console.log("Generated Proof:", JSON.stringify(proof, null, 2));
    console.log("Generated Public Signals:", JSON.stringify(publicSignals, null, 2));

    fs.writeFileSync("./proof.json", JSON.stringify(proof, null, 2));
    fs.writeFileSync("./publicInputSignals.json", JSON.stringify(publicSignals, null, 2));
    
    console.log("Proof & Public Input Generated and Saved!");
}

proof_generator().then(() => {
    process.exit(0);
});
