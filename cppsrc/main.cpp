/* cppsrc/main.cpp */
#include <napi.h>
#include <cstdint>
#include <string>
#include <cmath>
#include <functional>

int TOTAL_BITS = 64;
int EPOCH_BITS = 42;
int NODE_ID_BITS = 10;
int SEQUENCE_BITS = 12;

uint64_t maxNodeId = std::pow(2, NODE_ID_BITS) - 1;
uint64_t maxSequence = std::pow(2, SEQUENCE_BITS) - 1;

uint64_t sequence = 0;

int nodeID(std::string macID)
{
    return std::hash<std::string>()(macID) % maxNodeId;
}

int NODEID = 0;

uint64_t nextID(uint64_t currentTimestamp, uint64_t lastTimestamp, uint64_t sequence, std::string macID)
{
    NODEID = nodeID(macID);
    uint64_t id = currentTimestamp << (TOTAL_BITS - EPOCH_BITS);
    id |= (NODEID << (TOTAL_BITS - EPOCH_BITS - NODE_ID_BITS));
    id |= sequence;

    return id;
}

Napi::Number nextIDWrapped(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber() || !info[3].IsString())
    {
        Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
    }

    Napi::Number first = info[0].As<Napi::Number>();
    Napi::Number second = info[1].As<Napi::Number>();
    Napi::Number third = info[2].As<Napi::Number>();
    Napi::String fourth = info[3].As<Napi::String>();

    uint64_t returnValue = nextID(first.Int64Value(), second.Int64Value(), third.Int64Value(), fourth.Utf8Value());

    return Napi::Number::New(env, returnValue);
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    exports.Set("nextID", Napi::Function::New(env, nextIDWrapped));
    return exports;
}

NODE_API_MODULE(snowflake, InitAll)