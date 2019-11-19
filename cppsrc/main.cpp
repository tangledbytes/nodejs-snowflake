/* cppsrc/main.cpp */

#define NAPI_EXPERIMENTAL
#include <napi.h>
#include <cstdint>
#include <string>
#include <cmath>
#include <functional>
#include <chrono>
#include <thread>

// ////////////////////////////////////////////////////////////////////////////////////////

/**
 * Total number of bits allocated to an ID
*/
int TOTAL_BITS = 64;

/**
 * Total number of bits allocated to an epoch timestamp
*/
int EPOCH_BITS = 42;

/**
 * Total number of bits allocated to an node/machine id
*/
int NODE_ID_BITS = 10;

/**
 * Total number of bits allocated to an sequencing
*/
int SEQUENCE_BITS = 12;

/** 
 * Max node that can be used
*/
uint64_t maxNodeId = std::pow(2, NODE_ID_BITS) - 1;

uint64_t maxSequence = std::pow(2, SEQUENCE_BITS) - 1;

// ////////////////////////////////////////////////////////////////////////////////////////

/**
 * Covert the macID string passed as a parameter
 * into a hash value and return the bitwise & with maxNodeID
 * so that the hashed value is always smaller than maxNodeID 
 * which is 10 bits in size
*/
int nodeID(std::string macID)
{
    return std::hash<std::string>()(macID) % maxNodeId;
}

// ////////////////////////////////////////////////////////////////////////////////////////

class Snowflake : public Napi::ObjectWrap<Snowflake>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Snowflake(const Napi::CallbackInfo &info);

private:
    static Napi::FunctionReference constructor;
    uint64_t _lastTimestamp;
    int _sequence;
    std::string _macID;
    int _nodeID;
    Napi::Value getUniqueIDBigInt(const Napi::CallbackInfo &info);
    Napi::Value getUniqueID(const Napi::CallbackInfo &info);
    Napi::Value getTimestampFromID(const Napi::CallbackInfo &info);
};

Napi::Object Snowflake::Init(Napi::Env env, Napi::Object exports)
{
    // This method is used to hook the accessor and method callbacks
    Napi::Function func = DefineClass(env, "Snowflake", {InstanceMethod("getUniqueIDBigInt", &Snowflake::getUniqueIDBigInt), InstanceMethod("getUniqueID", &Snowflake::getUniqueID), InstanceMethod("getTimestampFromID", &Snowflake::getTimestampFromID)});

    // Create a peristent reference to the class constructor. This will allow
    // a function called on a class prototype and a function
    // called on instance of a class to be distinguished from each other.
    constructor = Napi::Persistent(func);
    // Call the SuppressDestruct() method on the static data prevent the calling
    // to this destructor to reset the reference when the environment is no longer
    // available.
    constructor.SuppressDestruct();
    exports.Set("Snowflake", func);
    return exports;
}

Snowflake::Snowflake(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Snowflake>(info)
{
    Napi::String value = info[0].As<Napi::String>();
    this->_macID = value.Utf8Value();
    this->_nodeID = nodeID(this->_macID);
    this->_lastTimestamp = 0;
    this->_sequence = 0;
}

Napi::FunctionReference Snowflake::constructor;

/**
 * Takes the current timestamp, last timestamp, sequence, and macID
 * and generates a 64 bit long integer by performing bitwise operations
 * 
 * First 42 bits are filled with current timestamp
 * Next 10 bits are filled with the node/machine id (max size can be 1024)
 * Next 12 bits are filled with sequence which ensures that even if timestamp didn't change the value will be generated
 * 
 * Function can theorotically generate 1024 unique values within a millisecond without repeating values
*/
Napi::Value Snowflake::getUniqueIDBigInt(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    Napi::Number first = info[0].As<Napi::Number>();

    uint64_t currentTimestamp = first.Int64Value();

    if (currentTimestamp == this->_lastTimestamp)
    {
        this->_sequence = (this->_sequence + 1) & maxSequence;
        if (this->_sequence == 0)
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }
    else
    {
        this->_sequence = 0;
    }

    this->_lastTimestamp = currentTimestamp;

    uint64_t id = currentTimestamp << (TOTAL_BITS - EPOCH_BITS);
    id |= (this->_nodeID << (TOTAL_BITS - EPOCH_BITS - NODE_ID_BITS));
    id |= this->_sequence;

    return Napi::BigInt::New(env, id);
}

/**
 * Convert generated number 64 bit integer to a string
*/
Napi::Value Snowflake::getUniqueID(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    Napi::Number first = info[0].As<Napi::Number>();

    uint64_t currentTimestamp = first.Int64Value();

    if (currentTimestamp == this->_lastTimestamp)
    {
        this->_sequence = (this->_sequence + 1) & maxSequence;
        if (this->_sequence == 0)
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }
    else
    {
        this->_sequence = 0;
    }

    this->_lastTimestamp = currentTimestamp;

    uint64_t id = currentTimestamp << (TOTAL_BITS - EPOCH_BITS);
    id |= (this->_nodeID << (TOTAL_BITS - EPOCH_BITS - NODE_ID_BITS));
    id |= this->_sequence;

    return Napi::String::New(env, std::to_string(id));
}

/**
 * Returns timestamp at which the id was generated by retreiving
 * the first 42 bits of the id, which are filled with current timestamp
 * bits
*/
Napi::Value Snowflake::getTimestampFromID(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    uint64_t uniqueID = 0;

    if (info[0].IsString())
    {
        Napi::String first = info[0].As<Napi::String>();

        uniqueID = std::stoull(first.Utf8Value());
    }
    else if (info[0].IsNumber())
    {
        uniqueID = info[0].As<Napi::Number>().Int64Value();
    }
    else
    {
        Napi::TypeError::New(env, "Number or string expected").ThrowAsJavaScriptException();
    }

    uint64_t timestamp = uniqueID >> (TOTAL_BITS - EPOCH_BITS);

    return Napi::Number::New(env, timestamp);
}

// ////////////////////////////////////////////////////////////////////////////////////////

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    Snowflake::Init(env, exports);
    return exports;
}

NODE_API_MODULE(snowflake, InitAll)