pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// Proves that a character is within a specific range (e.g., lowercase letters)
template CharInRange() {
    signal input char;
    signal input lowerBound;
    signal input upperBound;
    signal output inRange;

    component greaterEqThan = GreaterEqThan(8);
    component lessEqThan = LessEqThan(8);

    greaterEqThan.in[0] <== char;
    greaterEqThan.in[1] <== lowerBound;

    lessEqThan.in[0] <== char;
    lessEqThan.in[1] <== upperBound;

    inRange <== greaterEqThan.out * lessEqThan.out;
}

// Proves properties of the input string
template LLMInputProof(maxLength) {
    signal input string[maxLength];
    signal input actualLength;
    signal input hasLowercase;
    signal input hasUppercase;
    signal input hasDigit;
    signal output valid;

    // Prove actual length
    component lengthCheck = LessEqThan(32);
    lengthCheck.in[0] <== actualLength;
    lengthCheck.in[1] <== maxLength;
    lengthCheck.out === 1;

    // Check for character types
    component lowercaseCheck[maxLength];
    component uppercaseCheck[maxLength];
    component digitCheck[maxLength];

    signal lowercaseSum[maxLength+1];
    signal uppercaseSum[maxLength+1];
    signal digitSum[maxLength+1];

    lowercaseSum[0] <== 0;
    uppercaseSum[0] <== 0;
    digitSum[0] <== 0;

    for (var i = 0; i < maxLength; i++) {
        lowercaseCheck[i] = CharInRange();
        lowercaseCheck[i].char <== string[i];
        lowercaseCheck[i].lowerBound <== 97; // 'a'
        lowercaseCheck[i].upperBound <== 122; // 'z'
        lowercaseSum[i+1] <== lowercaseSum[i] + lowercaseCheck[i].inRange;

        uppercaseCheck[i] = CharInRange();
        uppercaseCheck[i].char <== string[i];
        uppercaseCheck[i].lowerBound <== 65; // 'A'
        uppercaseCheck[i].upperBound <== 90; // 'Z'
        uppercaseSum[i+1] <== uppercaseSum[i] + uppercaseCheck[i].inRange;

        digitCheck[i] = CharInRange();
        digitCheck[i].char <== string[i];
        digitCheck[i].lowerBound <== 48; // '0'
        digitCheck[i].upperBound <== 57; // '9'
        digitSum[i+1] <== digitSum[i] + digitCheck[i].inRange;
    }

    signal lowercaseFound;
    signal uppercaseFound;
    signal digitFound;

    lowercaseFound <== hasLowercase * lowercaseSum[maxLength];
    uppercaseFound <== hasUppercase * uppercaseSum[maxLength];
    digitFound <== hasDigit * digitSum[maxLength];

    // Ensure that if hasX is 1, the corresponding sum is > 0
    // And if hasX is 0, the corresponding sum is 0
    lowercaseFound * (1 - hasLowercase) === 0;
    uppercaseFound * (1 - hasUppercase) === 0;
    digitFound * (1 - hasDigit) === 0;

    (1 - hasLowercase) * lowercaseSum[maxLength] === 0;
    (1 - hasUppercase) * uppercaseSum[maxLength] === 0;
    (1 - hasDigit) * digitSum[maxLength] === 0;

    valid <== 1;
}

component main {public [actualLength, hasLowercase, hasUppercase, hasDigit]} = LLMInputProof(256);
