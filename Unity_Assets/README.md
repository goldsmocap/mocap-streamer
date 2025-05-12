# Mocap Streamer Unity Assets

## Setup

### Streaming

To get setup inside unity, firstly there's a model (for axis studio) called [PN_Stickman_v12.1_NoPrefix](./PN_Stickman_v12.1_NoPrefix.zip). Add this to the scene.

Then attach the [MocapCharacterController](./MocapCharacterController.cs) script, which is essential for any character animating for the mocap streamer.

To get the streamer sending to unity, there needs to be a single instance of the [NetworkManager](./NetworkManager.cs) script, so create an empty object and attach this script to it. Make sure the `Receiving Data Port` is set to the same value as the port within the streamer (can be found under the receiving connection options).

Then to receive data from the streamer, the character needs the [NetworkCharacterController](./NetworkCharacterController.cs) script attached, where the `Peer Name` must be the same as the nickname of the person you're trying to receive the data from.\
Then the `Character ID` is the index of the character the person is sending. For clients that are only sending a single character, you can leave this at 0.\
However if a client is sending multiple characters, this will be the index of the character (e.g. if someone is sending 3 different characters, the first ID would be `0`, then the next is `1`, and the last would be `2`).

### Saving And Loading Animations

This is all contained in the Unity side of things.

To start with saving data, you need to attach the [NetworkCharacterRecorder](./NetworkCharacterRecorder.cs) script to the character you want to save the animation for. This has a `File Path` in it, where this will be the path of the file that will be created. You can use any extension, but it you need to remember it for playing it back.

Similarly, there's a [PlaybackCharacterController](./PlaybackCharacterController.cs) script, that when attached will be able to play the animation back. This has a `File Path` (the same file path as the one from the recorder). You can also configure the `Offset in Milliseconds`, i.e. how far into the clip you want to start the animation from, as well as a `Loop` mode, which will repeat the animation once it reaches the end of the clip.

NOTE: for the playback to work, you must disable the [NetworkCharacterController](./NetworkCharacterController.cs) script, as these two will try to play their animations on the same character and will clash.

### Arbitrary Data Streaming

The network manager will receive any arbitrary data sent from the streamer, as soon as you connect the receiving connection.

This can then be interacted with from the [NetworkManager](./NetworkManager.cs) using the `TryGetData` and `SendData` methods.

Example use cases can be found in [DataSenderTest](./DataSenderTest.cs) and [DataReceiverTest](./DataReceiverTest.cs).

NOTE: The manager will always return the latest data from a peer, even if that peer isn't connected/sending data anymore.

## Saved Clip Format

The saved clips have both a header and a data section. All the serialisation/deserialisation is done inside [AnimationFrame](./AnimationFrame.cs), so look there if you need implementation details of how this works.

### Clip Header

The header first contains the ASCII encoded name of the skeleton, followed by a null byte (AKA 0 byte, used as a separator).\
Then is a `uint16` which is how many segments the skeleton has.\
Then comes all the ASCII encoded names of the segments, where they have a null byte after each segment name (again used as a separator byte). The number of segment names is equal to the `uint16` which was just read.

### Clip Data

Following the last null byte of the header, comes the data.

For each frame of the animation, there is a `uint16` which is the time delta (in milliseconds) between the previous frame and the current frame, where for the very first frame, this is `0`.

Next comes the positional/rotation data where for every segment, the data is serialised in the following order:
`x position`, `y position`, `z position`, `x euler rotation`, `y euler rotation`, `z euler rotation`

These are all serialised as `float32`.

The order of the segments is the same as the order of the names of the segments, so these can be linked.

### Segment Names

Segment names are the same as the name of the transforms - see [MocapCharacterController](./MocapCharacterController.cs) for more information on how the data is being set.
