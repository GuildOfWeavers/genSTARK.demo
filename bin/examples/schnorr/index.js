"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const assert = require("assert");
const genstark_1 = require("@guildofweavers/genstark");
const utils_1 = require("./utils");
// STARK DEFINITION
// ================================================================================================
// define security options for the STARK
const options = {
    hashAlgorithm: 'blake2s256',
    extensionFactor: 16,
    exeQueryCount: 48,
    friQueryCount: 24,
    wasm: false
};
// create the STARK for Schnorr signatures
const sigStark = genstark_1.instantiate('./examples/schnorr/schnorr.aa', 'default', options);
// CONTROL VALUES
// ================================================================================================
const message = 'testing';
const g = utils_1.getGenerator();
const keys = utils_1.getRandomKeys();
const signature = utils_1.sign(message, keys.sk);
const h = utils_1.hashMessage(message, keys.pk, signature.r);
const result = utils_1.verify(message, keys.pk, signature);
console.log(`signature verified: ${result}`);
// TESTING
// ================================================================================================
const inputs = [
    [g[0]],
    [g[1]],
    [toBits(signature.s)],
    [keys.pk[0]],
    [keys.pk[1]],
    [toBits(h)],
    [signature.r[0]],
    [signature.r[1]]
];
// set up inputs and assertions
const assertions = [
    { step: 0, register: 0, value: g[0] },
    { step: 0, register: 1, value: g[1] },
    { step: 0, register: 2, value: 0n },
    { step: 0, register: 3, value: 0n },
    { step: 255, register: 7, value: signature.s },
    { step: 0, register: 8, value: keys.pk[0] },
    { step: 0, register: 9, value: keys.pk[1] },
    { step: 0, register: 10, value: signature.r[0] },
    { step: 0, register: 11, value: signature.r[1] },
    { step: 255, register: 14, value: h }
];
// prove that the assertions hold if we execute MiMC computation with given inputs
let proof = sigStark.prove(assertions, inputs);
console.log('-'.repeat(20));
// serialize the proof
let start = Date.now();
const buf = sigStark.serialize(proof);
console.log(`Proof serialized in ${Date.now() - start} ms; size: ${Math.round(buf.byteLength / 1024 * 100) / 100} KB`);
assert(buf.byteLength === sigStark.sizeOf(proof));
console.log('-'.repeat(20));
// deserialize the proof to make sure everything serialized correctly
start = Date.now();
proof = sigStark.parse(buf);
console.log(`Proof parsed in ${Date.now() - start} ms`);
console.log('-'.repeat(20));
// verify the proof
sigStark.verify(assertions, proof);
console.log('-'.repeat(20));
console.log(`STARK security level: ${sigStark.securityLevel}`);
// HELPER FUNCTIONS
// ================================================================================================
function buildInputs(inputCount) {
    const inputs = [];
    for (let i = 0; i < 8; i++) {
        inputs.push([]);
    }
    for (let i = 0; i < inputCount; i++) {
        let msg = `testing${i}`;
        let sig = utils_1.sign(msg, keys.sk);
        let h = utils_1.hashMessage(msg, keys.pk, sig.r);
        inputs[0].push(g[0]);
        inputs[1].push(g[1]);
        inputs[2].push(toBits(sig.s));
        inputs[3].push(keys.pk[0]);
        inputs[4].push(keys.pk[1]);
        inputs[5].push(toBits(h));
        inputs[6].push(sig.r[0]);
        inputs[7].push(sig.r[1]);
    }
    ;
    return { inputs };
}
function toBits(value) {
    const bits = value.toString(2).padStart(256, '0').split('');
    return bits.reverse().map(b => BigInt(b));
}
//# sourceMappingURL=index.js.map