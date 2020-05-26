#pragma once

enum class GET_IP_RES : int
{
    SUCCESS,
    ERR_COULD_NOT_SOCKET,
    ERR_COULD_NOT_CONNECT,
    ERR_COULD_NOT_GET_SOCKETNAME,
    ERR_COULD_NOT_GET_INET_NTOP
};

// Returns IPv4 of the current machine
GET_IP_RES getIP(char *);
