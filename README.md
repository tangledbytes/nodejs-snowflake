# nodejs-snowflake

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/utkarsh-pro/nodejs-snowflake/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/utkarsh-pro/nodejs-snowflake.svg)](https://github.com/utkarsh-pro/nodejs-snowflake/issues/)
![License](https://img.shields.io/npm/l/nodejs-snowflake)
![Top Language](https://img.shields.io/github/languages/top/utkarsh-pro/nodejs-snowflake)
![Version](https://img.shields.io/npm/v/nodejs-snowflake)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/utkarsh-pro/nodejs-snowflake/Releases)

nodejs-snowflake is a fast and reliable way to generate time sortable 64 bit ids written for distributed systems.  
The main ID generation function is written in Rust which interoperates with NodeJS via WASM, this makes the process of ID generation extremely fast.

> ⚠️ Version 2 Alert! Version 2 of `nodejs-snowflake` has a lot of breaking changes and is a complete rewrite. Consider going through entire doc to understand the migration path. Checkout [Version 2 PR Notes](https://github.com/utkarsh-pro/nodejs-snowflake/pull/14) for details.

## How to install

```
npm install nodejs-snowflake --save
yarn add nodejs-snowflake
```

## Usage

### Generate ID

```javascript
const { Snowflake } = require('nodejs-snowflake');

const uid = new Snowflake(config);

uid.getUniqueID(); // A 64 bit id is returned

```

#### Configuration
UniqueID constructor takes in the following configuration

```javascript
{
    custom_epoch: number, // Defaults to Date.now(). This is UNIX timestamp in ms
    instance_id: number // A value ranging between 0 - 4095. If not provided then a random value will be used
}
```

### Get ID corresponding to a Timestamp
This can be extremely helpful in writing database queries where the requirement could be to get entries created after a certain timestamp.

```javascript
...

const id = uid.idFromTimestamp(Date.now()); // Here id will always be BigInt

console.log(id); // A 64 bit id is returned corresponding to the timestamp given

```

### Get timestamp from the ID
Get the timestamp of creation of the ID can be extracted by using this method. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

// Pass the custom epoch that was used to generate this ID
const ts = Snowflake.timestampFromID(id, uid.customEpoch());

console.log(ts) // Timestamp of creation of the id

```

### Get machine id from the ID
Get the machine id of the machine on which the token was generated. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

const mid = Snowflake.instanceIDFromID(id);

console.log(mid); // 2345 -> This is the 12 bit long machine id where this token was generated

```

### Get the current machine id
This solely exits to find the machine id of current machine in case the user didn't provided as machine id and relied on the randomly generated value.

```javascript
...

uid.instanceID(); // The instance id of the current instance, set either by user or randomly generated

```
