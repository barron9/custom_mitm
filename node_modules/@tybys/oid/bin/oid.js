#!/usr/bin/env node

var ObjectId = require('../index.js');

function printHelp() {
  console.log('Usage: oid [options]');
  console.log('\nOptions:');
  console.log('  -v, -V, --version   output the version number');
  console.log('  -h, --help          output usage information');
  console.log('  -n, --number <N>    output N number of ObjectIds');
  console.log('\nRepo: https://github.com/toyobayashi/oid');
}

function main(argc, argv) {
  if (argc <= 2) {
    console.log(new ObjectId().toHexString());
    return 0;
  }

  if (argv[2] === '-v' || argv[2] === '--version' || argv[2] === '-V') {
    console.log(require('../package.json').version);
    return 0;
  }

  if (argv[2] === '-h' || argv[2] === '--help') {
    printHelp();
    return 0;
  }

  if (argv[2] === '-n' || argv[2] === '--number') {
    var n = Number(process.argv[3]) || 1;
    for (var i = 0; i < n; i++) {
      console.log(new ObjectId().toHexString());
    }
    return 0;
  }

  printHelp();
  return 0;
}

process.exit(main(process.argv.length, process.argv));
