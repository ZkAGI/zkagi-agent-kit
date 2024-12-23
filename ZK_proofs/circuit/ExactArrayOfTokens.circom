pragma circom 2.0.0;

template ExactArrayOfTokens(maxLength) {
    signal input arrayLength;
    signal input tokens[maxLength];
    signal output outTokens[maxLength];
    signal isValid[maxLength];

    // Ensure arrayLength is within bounds
    assert(arrayLength <= maxLength);

    // Compute isValid for all indices
    for (var i = 0; i < maxLength; i++) {
        // Initialize isValid[i] based on whether i is less than arrayLength
        isValid[i] <-- (i < arrayLength) ? 1 : 0;

        // Constrain isValid[i] to be either 0 or 1
        isValid[i] * (1 - isValid[i]) === 0;
    }

    // Ensure the sum of isValid signals equals arrayLength
    signal sum[maxLength + 1];
    sum[0] <== 0;
    for (var i = 0; i < maxLength; i++) {
        sum[i + 1] <== sum[i] + isValid[i];
    }
    sum[maxLength] === arrayLength;

    // Process each token
    for (var i = 0; i < maxLength; i++) {
        // If isValid[i] is 1, outTokens[i] = tokens[i], else outTokens[i] = 0
        outTokens[i] <== tokens[i] * isValid[i];
    }
}

// Usage example
component main {public [arrayLength]} = ExactArrayOfTokens(1000);
