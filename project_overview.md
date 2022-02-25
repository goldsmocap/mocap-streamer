


                           + -------------- +
    + ------------------>  |  Remote Server | <- Running in the cloud (Digital Ocean)
    |                      + -------------- +
    |                         ^          ^
    |                         |          |
    |                         |          |   WS (sending mocap data)
    |           + ----------- +          + ----------- +
    |           |                   |                  |
    |           \/          UK      |    USA           \/
    |   + -------------- +          |          + -------------- +
    |   |  Local Server  |          |          |  Local Server  | <- Connected to Axis Neuron mocap suit via UDP (port 7002)
    |   + -------------- +          |          + -------------- +
    |           ^                   |                       \
    |           |                   |                        \
    |           \/                  |                         \   <- UDP socket (sending labeled mocap data from local suit and/or remote suits)
    |     + -------- +              |
    + --- |  Web UI  |              |
          + -------- +              |