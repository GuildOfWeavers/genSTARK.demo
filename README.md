# genSTARK Demo

This repository provides examples of using [genSTARK](https://github.com/GuildOfWeavers/genSTARK) library.

## Environment

To make the best use of examples in this repository, you'll need the following:

1. [Node.js](https://nodejs.org/) - you'll need this to run the examples. Version 12.x would do.
2. [VS Code](https://code.visualstudio.com/) - you'll need it to edit files. Version 1.41 or higher would do.
4. [AirScript Syntax Highlighter](https://marketplace.visualstudio.com/items?itemName=marinthiercelin.airscript-syntax-highlighter) for VS Code - this will make editing AirScript files much nicer.
4. [TypeScript](https://www.typescriptlang.org/) (this usually comes with VS Code) - you'll need this recompile TypeScript files.

## Usage
To run the examples in this repo, do the following:

1. Make sure your environment is set up as described above.
2. Clone the project locally: `git clone https://github.com/GuildOfWeavers/genSTARK.demo.git`
3. Run `npm install` - this will download all dependencies

## Examples
This repository contains the following examples:

1. [MiMC](/examples/mimc) - contains [AirScript](https://github.com/GuildOfWeavers/AirScript) code for [MiMC computation](https://vitalik.ca/general/2018/07/21/starks_part_3.html#mimc).
2. [Poseidon](/examples/poseidon) - contains [AirScript](https://github.com/GuildOfWeavers/AirScript) code for [Poseidon](https://eprint.iacr.org/2019/458) hash function, including an example of using the function for Merkle tree verification.
3. [Poseidon](/examples/rescue) - contains [AirScript](https://github.com/GuildOfWeavers/AirScript) code for [Rescue](https://eprint.iacr.org/2019/426) hash function, including an example of using the function for Merkle tree verification.

# License
[MIT](/LICENSE) © 2020 Guild of Weavers