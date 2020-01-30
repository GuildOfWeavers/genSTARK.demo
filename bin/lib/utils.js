"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const air_assembly_1 = require("@guildofweavers/air-assembly");
// PRINTING
// ================================================================================================
function runMimc(field, steps, seed) {
    const roundConstants = [1n, 2n, 3n, 4n];
    const result = [seed];
    for (let i = 0; i < steps - 1; i++) {
        let value = field.add(field.exp(result[i], 3n), roundConstants[i % roundConstants.length]);
        result.push(value);
    }
    return result;
}
exports.runMimc = runMimc;
// POSEIDON
// ================================================================================================
function poseidonHash(field, v1, v2) {
    const rounds = 63;
    const fullRounds = 8;
    const mds = field.newMatrixFrom([
        [2839769753n, 1346737110n, 1785908782n],
        [188086132n, 2502886257n, 1931847234n],
        [3765329763n, 2749177114n, 93405347n]
    ]);
    const roundConstants = [
        air_assembly_1.prng.sha256(Buffer.from('01', 'hex'), rounds, field),
        air_assembly_1.prng.sha256(Buffer.from('02', 'hex'), rounds, field),
        air_assembly_1.prng.sha256(Buffer.from('03', 'hex'), rounds, field),
    ];
    const ark = [];
    for (let i = 0; i < rounds; i++) {
        ark[i] = field.newVectorFrom([
            roundConstants[0][i],
            roundConstants[1][i],
            roundConstants[2][i]
        ]);
    }
    let state = field.newVectorFrom([v1, v2, 0n]);
    for (let i = 0; i < rounds; i++) {
        state = field.addVectorElements(state, ark[i % rounds]);
        if ((i < fullRounds / 2) || i >= rounds - fullRounds / 2) {
            // full round
            state = field.expVectorElements(state, 5n);
        }
        else {
            // partial round
            let stateValues = state.toValues();
            stateValues[2] = field.exp(stateValues[2], 5n);
            state = field.newVectorFrom(stateValues);
        }
        state = field.mulMatrixByVector(mds, state);
    }
    return state.getValue(0);
}
exports.poseidonHash = poseidonHash;
class MerkleTree {
    constructor(values, hash) {
        this.nodes = [...new Array(values.length), ...values];
        for (let i = values.length - 1; i > 0; i--) {
            this.nodes[i] = hash(this.nodes[i * 2], this.nodes[i * 2 + 1]);
        }
    }
    get root() {
        return this.nodes[1];
    }
    prove(index) {
        index += Math.floor(this.nodes.length / 2);
        const proof = [this.nodes[index]];
        while (index > 1) {
            proof.push(this.nodes[index ^ 1]);
            index = index >> 1;
        }
        return proof;
    }
    static verify(root, index, proof, hash) {
        index += 2 ** proof.length;
        let v = proof[0];
        for (let i = 1; i < proof.length; i++) {
            if (index & 1) {
                v = hash(proof[i], v);
            }
            else {
                v = hash(v, proof[i]);
            }
            index = index >> 1;
        }
        return root === v;
    }
}
exports.MerkleTree = MerkleTree;
function toBinaryArray(value, length) {
    const binText = value.toString(2);
    const result = new Array(length).fill(0n);
    for (let i = binText.length - 1, j = 0; i >= 0; i--, j++) {
        result[j] = BigInt(binText[i]);
    }
    return result;
}
exports.toBinaryArray = toBinaryArray;
// PRINTING
// ================================================================================================
function printExecutionTrace(trace) {
    const steps = trace.dTrace.colCount;
    const colWidth = Math.ceil(trace.dTrace.elementSize * 1.2);
    // print header row
    const columnHeaders = ['step'.padEnd(colWidth, ' ')];
    columnHeaders.push(' | ');
    for (let i = 0; i < trace.sTrace.rowCount; i++) {
        columnHeaders.push(`s${i}`.padEnd(colWidth, ' '));
    }
    columnHeaders.push(' | ');
    for (let i = 0; i < trace.dTrace.rowCount; i++) {
        columnHeaders.push(`r${i}`.padEnd(colWidth, ' '));
    }
    const headerRow = columnHeaders.join('  ');
    console.log(headerRow);
    console.log('-'.repeat(headerRow.length));
    // print rows
    for (let i = 0; i < steps; i++) {
        let dataRow = [`${i}`.padEnd(colWidth, ' ')];
        dataRow.push(' | ');
        for (let j = 0; j < trace.sTrace.rowCount; j++) {
            dataRow.push(`${trace.sTrace.getValue(j, i)}`.padEnd(colWidth, ' '));
        }
        dataRow.push(' | ');
        for (let j = 0; j < trace.dTrace.rowCount; j++) {
            dataRow.push(`${trace.dTrace.getValue(j, i)}`.padEnd(colWidth, ' '));
        }
        console.log(dataRow.join('  '));
    }
    console.log('-'.repeat(headerRow.length));
}
exports.printExecutionTrace = printExecutionTrace;
//# sourceMappingURL=utils.js.map