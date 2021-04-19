# nodejs-snowflake

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/utkarsh-pro/nodejs-snowflake/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/utkarsh-pro/nodejs-snowflake.svg)](https://github.com/utkarsh-pro/nodejs-snowflake/issues/)
![Dependencies](https://img.shields.io/david/utkarsh-pro/nodejs-snowflake)

nodejs-snowflake is a fast and reliable way to generate time sortable 64 bit ids written for distributed systems.  
The main id generation function is written in C++ using N-API which makes the process of id generation extremely fast. The usage of C++ for id generation also guaratees that the generated number will be of size 64 bits.  

**Version 1.6 Updates**
- Add `GetIDFromTimestamp` function which can be used in database queries.  

**Version 1.5 Updates**
- Add `GetMachineIDFromID` help extracting machine id from the generated ids, even if they were generated on different machines

## How to install

```
npm install nodejs-snowflake --save
yarn add nodejs-snowflake
```

### NOTE
The ID generator produces ids faster if the return type is bigint, but this option is disabled by default. Do the following to enable this feature.

```javascript

const { UniqueID } = require('nodejs-snowflake');

const uid = new UniqueID({
    returnNumber: true
}); 

const ID = uid.getUniqueID(); // This id is in javascript bigint format

```

### VERSION 1.5.x Notice
In earlier versions of nodejs-snowflake, mac address was used for generating the unique ids. This is **no** longer supported in versions 1.5.x due to multiple reasons. Instead of the mac address it now uses "machine id" (value can range from 0 - 4095) which are supposed to be passed by the user. If no machine id is passed by the user then a random number would be used. The benefit of this approach is now the library supports extraction of machine id from the generated ids (irrespective of the machine used to generate it) which can be very useful in error detection in a clustered environment.

```javascript

const { UniqueID } = require('nodejs-snowflake');

const uid = new UniqueID({
    ...,
    machineID: 2345 // Any number between 0 - 4095. If not provided then a random number will be used
}); 

```

## Usage

### Generate ID

```javascript
const { UniqueID } = require('nodejs-snowflake');

const uid = new UniqueID(config);

uid.getUniqueID(); // A 64 bit id is returned

uid.asyncGetUniqueID().then(id => console.log(id)); // Promisified version of the above method

```

#### Configuration
UniqueID constructor takes in the following configuration

```javascript
{
    returnNumber: boolean, // Defaults to false. If set to true, the returned ids will be of type bigint or else of type string
    customEpoch: number, // Defaults to 1546300800000 (01-01-2019). This is UNIX timestamp in ms
    machineID: number // A value ranging between 0 - 4095. If not provided then a random value will be used
}
```

### Get timestamp from the ID
Get the timestamp of creation of the ID can be extracted by using this method. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

uid.getTimestampFromID(id); // Here id can be either as as string or as a bigint

```

### Get machine id from the ID
Get the machine id of the machine on which the token was generated. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

const mid = uid.getMachineIDFromID(id); // Here id can be either as as string or as a bigint

console.log(mid); // 2345 -> This is the 12 bit long machine id where this token was generated

```

### Get ID corresponding to a Timestamp
This can be extremely helpful in writing database queries where the requirement could be to get entries created after a certain timestamp.

```javascript
...

const id = uid.IDFromTimestamp(Date.now()); // Here id will always be BigInt

console.log(id); // A 64 bit id is returned corresponding to the timestamp given

```

### Get the current machine id
This solely exits to find the machine id of current machine in case the user didn't provided as machine id and relied on the randomly generated value.

```javascript
...

uid.machineID; // The machine id of the current machine, set either by user or randomly generated

```


## Basic benchmark
```bash
# Run for 1sec while invoking function every ms (default)
npm run benchmark 

# All the arguments
# --time -> Total time for which the id should be generated
# --type -> Return type of the id (could be number or string)
# --interval -> Time interval in which id generation function should invoked
# UNITS OF TIME
# 1s = 1 second, 1m = 1 millisecond, 1u = 1 microsecond

npm run benchmark -- --time=2s --type=number --interval=1u

```
