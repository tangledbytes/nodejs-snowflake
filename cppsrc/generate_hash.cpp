#include "generate_hash.h"

int generate_hash(const char *str, int s)
{
    int result = 0;
    const int prime = 31;
    for (int i = 0; i < s; ++i)
    {
        result = str[i] + (result * prime);
    }

    return result;
}