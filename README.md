# nodejs-snowflake

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/utkarsh-pro/nodejs-snowflake/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/utkarsh-pro/nodejs-snowflake.svg)](https://GitHub.com/utkarsh-pro/nodejs-snowflake/issues/)

nodejs-snowflake is a fast and reliable way to generate time sortable 64 bit ids written for distributed systems.  
The main id generation function is written in C++ using N-API which makes the process of id generation extremely fast. The usage of C++
for id generation also guaratees that the generated number will be of size 64 bits.

## How to install

```
npm install nodejs-snowflake --save
```

## Usage
```javascript

const { UniqueID } = require('nodejs-flake');

const uid = new UniqueID(); // A custom epoch can also be passed into the constructor default is 1546300800000 (01-01-2019)
// const uid = new UniqueID(customEpoch);

// With then and catch
uid.init().then(() => {
    const ID = uid.getUniqueID(); // 116321924208963580 -> 64 bit id
    uid.getTimestampFromID(ID); // 1574034107888 -> epoch timestamp of creation of the id independent of the machine it was created on

    // Get your machine's macID
    uid.getMacID();
})

// async await IIFE
(async () => {
    await uid.init();
    const ID = uid.getUniqueID(); // 116321924208963580 -> 64 bit id
    uid.getTimestampFromID(ID); // 1574034107888 -> epoch timestamp of creation of the id independent of the machine it was created on

    // Get your machine's macID
    uid.getMacID();
})()
```
