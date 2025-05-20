//=============================================================================
// Copyright © 2025 NaturalPoint, Inc. All Rights Reserved.
// 
// THIS SOFTWARE IS GOVERNED BY THE OPTITRACK PLUGINS EULA AVAILABLE AT https://www.optitrack.com/about/legal/eula.html 
// AND/OR FOR DOWNLOAD WITH THE APPLICABLE SOFTWARE FILE(S) (“PLUGINS EULA”). BY DOWNLOADING, INSTALLING, ACTIVATING 
// AND/OR OTHERWISE USING THE SOFTWARE, YOU ARE AGREEING THAT YOU HAVE READ, AND THAT YOU AGREE TO COMPLY WITH AND ARE
//  BOUND BY, THE PLUGINS EULA AND ALL APPLICABLE LAWS AND REGULATIONS. IF YOU DO NOT AGREE TO BE BOUND BY THE PLUGINS
//  EULA, THEN YOU MAY NOT DOWNLOAD, INSTALL, ACTIVATE OR OTHERWISE USE THE SOFTWARE AND YOU MUST PROMPTLY DELETE OR
//  RETURN IT. IF YOU ARE DOWNLOADING, INSTALLING, ACTIVATING AND/OR OTHERWISE USING THE SOFTWARE ON BEHALF OF AN ENTITY,
//  THEN BY DOING SO YOU REPRESENT AND WARRANT THAT YOU HAVE THE APPROPRIATE AUTHORITY TO ACCEPT THE PLUGINS EULA ON
//  BEHALF OF SUCH ENTITY. See license file in root directory for additional governing terms and information.
//=============================================================================

/*********************************************************************
 * \page   NatNetCAPI.h
 * \file   NatNetCAPI.h
 * \brief  C language compatible helper functions for the NatNet SDK.
 *********************************************************************/

#pragma once

#include "NatNetTypes.h"


#if defined( __cplusplus )
extern "C" {
#endif


typedef struct NatNetDiscovery_t* NatNetDiscoveryHandle;


NATNET_API void NATNET_CALLCONV NatNet_GetVersion( unsigned char outVersion[4] );
NATNET_API void NATNET_CALLCONV NatNet_SetLogCallback( NatNetLogCallback pfnLogCallback );

NATNET_API void NATNET_CALLCONV NatNet_DecodeID( int compositeId, int* pOutEntityId, int* pOutMemberId );
NATNET_API ErrorCode NATNET_CALLCONV NatNet_DecodeTimecode( unsigned int timecode, unsigned int timecodeSubframe, int* pOutHour, int* pOutMinute, int* pOutSecond, int* pOutFrame, int* pOutSubframe );
NATNET_API ErrorCode NATNET_CALLCONV NatNet_TimecodeStringify( unsigned int timecode, unsigned int timecodeSubframe, char* outBuffer, int outBufferSize );

/// <summary>
///     Helper that performs a deep copy from <paramref name="pSrc"/> into <paramref name="pDst"/>.
/// </summary>
/// <remarks>
///     Some members of <paramref name="pDst"/> will be dynamically allocated. Call <see cref="NatNet_FreeFrame"/> to
///     deallocate them.
/// </remarks>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_CopyFrame( sFrameOfMocapData* pSrc, sFrameOfMocapData* pDst );

/// <summary>
///     Frees the dynamically allocated members of a frame copy created using <see cref="NatNet_CopyFrame"/>.
/// </summary>
/// <remarks>
///     The object pointed to by <paramref name="pFrame"/> itself is NOT de-allocated, only its nested members which
///     were dynamically allocated.
///
///     Warning: Do not call this on any <paramref name="pFrame"/> that was not the destination of a call to
///              <see cref="NatNet_CopyFrame"/>.
/// </remarks>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_FreeFrame( sFrameOfMocapData* pFrame );


/// <summary>
///     Deallocates <paramref name="pDesc"/> and all of its members; after this call, the object is no longer valid.
/// </summary>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_FreeDescriptions( sDataDescriptions* pDesc );


// "xxx.xxx.xxx.xxx" + null terminator
enum { kNatNetIpv4AddrStrLenMax = 16 };

typedef struct sNatNetDiscoveredServer
{
    char localAddress[kNatNetIpv4AddrStrLenMax];
    char serverAddress[kNatNetIpv4AddrStrLenMax];
    uint16_t serverCommandPort;
    sServerDescription serverDescription;
} sNatNetDiscoveredServer;

typedef void (NATNET_CALLCONV* NatNetServerDiscoveryCallback)( const sNatNetDiscoveredServer* pNewServer, void* pUserContext );

/// <summary>
///     Sends broadcast messages to discover active NatNet servers and blocks for a specified time to gather responses.
/// </summary>
/// <param name="outServers">
///     Array of length equal to the input value of <paramref name="pInOutNumServers"/>. This array will receive the
///     details of all servers discovered by the broadcast.
/// </param>
/// <param name="pInOutNumServers">
///     Pointer to an integer containing the length of the array <paramref name="outServers"/>. After this function
///     returns, the integer is modified to contain the total number of servers that responded to the broadcast
///     inquiry. If the modified number is larger than the original number passed to the function, there was
///     insufficient space for those additional servers.
/// </param>
/// <param name="timeoutMillisec">
///     Amount of time, in milliseconds, to wait for responses to the broadcast before returning.
/// </param>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_BroadcastServerDiscovery( sNatNetDiscoveredServer* outServers, int* pInOutNumServers, unsigned int timeoutMillisec = 1000 );

/// <summary>
///     Begins sending periodic broadcast messages to discover active NatNet servers in the background.
/// </summary>
/// <param name="pOutDiscovery">
///     Out pointer that will receive a handle representing the asynchronous discovery process. The handle returned
///     should be passed to <see cref="NatNet_FreeAsyncServerDiscovery"/> later for cleanup.
/// </param>
/// <param name="pfnCallback">
///     A <see cref="NatNetServerDiscoveryCallback"/> function pointer that will be invoked once for every new server
///     that's discovered by the asynchronous search. The callback will also be passed the provided
///     <paramref name="pUserContext"/> argument.
/// </param>
/// <param name="pUserContext">
///     User-specified context data to be passed to the provided <paramref name="pfnCallback"/> when invoked.
/// </param>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_CreateAsyncServerDiscovery( NatNetDiscoveryHandle* pOutDiscovery, NatNetServerDiscoveryCallback pfnCallback, void* pUserContext = NULL );

/// <summary>
///     Ends a previously created asynchronous server discovery process, and cleans up the associated resources.
/// </summary>
/// <param name="discovery">
///     The handle representing the asynchronous discovery process. Returned by
///     <see cref="NatNet_CreateAsyncServerDiscovery"/>.
/// </param>
NATNET_API ErrorCode NATNET_CALLCONV NatNet_FreeAsyncServerDiscovery( NatNetDiscoveryHandle discovery );


#if defined( __cplusplus )
} // extern "C"
#endif
