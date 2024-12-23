const snarkjs = require("snarkjs");
const fs = require("fs");

async function verifier(circuit) {
    // Load the verification key from the circuit's verification key file
    const vKey = JSON.parse(fs.readFileSync(`./keys/${circuit}_verification_key.json`));

    // Load the proof and public signals from their respective files
    const proof = JSON.parse(fs.readFileSync('./proof.json'));
    const publicSignals = JSON.parse(fs.readFileSync('./publicInputSignals.json'));

    // Verify the proof using snarkjs
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    // Log the result of the verification
    if (res === true) {
        console.log("Proof verified successfully");
    } else {
        console.log("Invalid proof");
    }
}

// Call the verifier function with the correct circuit name
verifier('ExactArrayOfTokens').then(() => {
    process.exit(0);
});
