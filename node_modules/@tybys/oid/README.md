# oid-js

Use MongoDB ObjectID without installing bson.

* `index.js`: 18KB
* `dist/oid.min.js`: 8KB

## Usage

``` bash
$ npm install @tybys/oid
```

### CLI

```
$ oid -h
Usage: oid [options]

Options:
  -v, -V, --version   output the version number
  -h, --help          output usage information
  -n, --number <N>    output N number of ObjectIds

Repo: https://github.com/toyobayashi/oid
```

### Browser

IE OK!

``` html
<script src="node_modules/@tybys/oid/index.js"></script>
<!-- or -->
<!-- <script src="node_modules/@tybys/oid/dist/oid.min.js"></script> -->
<!-- or end -->

<script>
var oid = new ObjectId();
console.log(oid);
</script>
```

### Node.js

``` js
const ObjectId = require('@tybys/oid')
const oid = new ObjectId()
console.log(oid)
```

### TypeScript

``` ts
import * as ObjectId from '@tybys/oid'
const oid = new ObjectId()
console.log(oid)
```

## API

Same as [mongodb/js-bson/lib/objectid.js](https://github.com/mongodb/js-bson/blob/master/lib/objectid.js).

See [`index.d.ts`](https://github.com/toyobayashi/oid/blob/master/index.d.ts).

``` ts
declare class ObjectId {
  constructor(id?: number | string | number[] | Uint8Array | ObjectId);

  static createFromTime(time: number): ObjectId;

  static createFromHexString(hexString: string): ObjectId;

  static isValid(otherId: number | string | number[] | Uint8Array | ObjectId): boolean;

  static createPk(): ObjectId;

  static generate(time?: number): number[] | Uint8Array;

  static getInc(): number;

  static fromExtendedJSON(doc: ObjectId.Document): ObjectId;

  static index: number;

  readonly id: string | number[] | Uint8Array;

  readonly _bsontype: 'ObjectID';

  generationTime: number;

  toHexString(): string;

  equals(otherId: string | number[] | Uint8Array | ObjectId): boolean;

  getTimestamp(): Date;

  toString(format?: string): string;

  toJSON(): string;

  toExtendedJSON(): ObjectId.EmptyDocument;
}

declare namespace ObjectId {
  export interface EmptyDocument {
    $oid: string;
  }

  export interface Document extends EmptyDocument {
    [field: string]: any;
  }
}

export = ObjectId;
```
