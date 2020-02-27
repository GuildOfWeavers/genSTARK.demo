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
// TESTING
// ================================================================================================
// build inputs and assertions for verifying 4 signatures
const { inputs, assertions } = buildInputsAndAssertions(4);
// prove that the assertions hold if we execute signature verifications with given inputs
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
function buildInputsAndAssertions(signatureCount) {
    const g = utils_1.getGenerator();
    const keys = utils_1.getRandomKeys();
    const inputs = [];
    for (let i = 0; i < 8; i++) {
        inputs.push([]);
    }
    const assertions = [];
    for (let i = 0, start = 0, end = 255; i < signatureCount; i++, start += 256, end += 256) {
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
        assertions.push({ step: start, register: 0, value: g[0] });
        assertions.push({ step: start, register: 1, value: g[1] });
        assertions.push({ step: start, register: 2, value: 0n });
        assertions.push({ step: start, register: 3, value: 0n });
        assertions.push({ step: end, register: 7, value: sig.s });
        assertions.push({ step: start, register: 8, value: keys.pk[0] });
        assertions.push({ step: start, register: 9, value: keys.pk[1] });
        assertions.push({ step: start, register: 10, value: sig.r[0] });
        assertions.push({ step: start, register: 11, value: sig.r[1] });
        assertions.push({ step: end, register: 14, value: h });
    }
    return { inputs, assertions };
}
function toBits(value) {
    const bits = value.toString(2).padStart(256, '0').split('');
    return bits.reverse().map(b => BigInt(b));
}
//# sourceMappingURL=index.js.map