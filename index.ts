// IMPORTS
// ================================================================================================
import { instantiateScript } from '@guildofweavers/genstark';
import { printExecutionTrace, runMimc, poseidonHash, MerkleTree, toBinaryArray } from './lib/utils';

// CONSTANTS
// ================================================================================================
const scriptPaths: { [index: string]: string } = {
    'mimc'      : './exercises/mimc/mimc.air',
    'poseidon'  : './exercises/poseidon/hash.air',
    'merkle'    : './exercises/poseidon/merkle.air'
};

// TESTING
// ================================================================================================
const example = process.argv[2];
const scriptPath = scriptPaths[example];

// read inputs
let inputs: any[];
try {
    if (example === 'mimc') {
        const seed = BigInt(process.argv[3]);
        inputs = [[seed]];
    }
    else if (example === 'poseidon') {
        const v1 = BigInt(process.argv[3]);
        const v2 = BigInt(process.argv[4]);
        inputs = [[v1], [v2]];
    }
    else if (example === 'merkle') {
        const nodesString = process.argv[5];
        const nodes = nodesString.substr(1, nodesString.length - 2).split(',').map(v => BigInt(v.trim()));
        const index = toBinaryArray(Number(process.argv[3]), nodes.length);
        index.unshift(0n);
        index.pop();
        const leaf = BigInt(process.argv[4]);

        inputs = [[leaf], [nodes], [index]];
    }
}
catch (error) {
    console.error(`invalid arguments: ${error.message}`);
    process.exit(0);
}

// create STARK object and build execution trace
const stark = instantiateScript(scriptPath);
const trace = stark.generateExecutionTrace(inputs!);

// print execution trace
printExecutionTrace(trace);

// print control value
if (example === 'mimc') {
    const steps = 64;
    const seed = inputs![0][0];
    const control = runMimc(stark.air.field, steps, seed);
    console.log(`Running MiMC for ${steps} steps from value ${seed} should result in ${control[control.length - 1]}`);
}
else if (example === 'poseidon') {
    const values = [inputs![0][0], inputs![1][0]];
    const control = poseidonHash(stark.air.field, values[0], values[1]);
    console.log(`Hashing values ${values} with Poseidon hash function should result in ${control}`);
}
else if (example === 'merkle') {
    const leaves = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n];
    const tree = new MerkleTree(leaves, poseidonHash.bind(null, stark.air.field));
    console.log(`Merkle branch should resolve to root ${tree.root}`);
}