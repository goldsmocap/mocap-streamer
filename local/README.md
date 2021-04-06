# Building the project

TODO: finish this

# Deploying to Digital Ocean

## Build Docker Image

## Run Docker Container
The docker container must be run using the host's network hence the `--network host` option.

`sudo docker run -d --network host --name axis-streamer goldsmithsmocap/axis-streamer:<tag>`

TODO: finish ths

# Architecture

TODO: finish this

# Troubleshooting

**Unity not picking up data stream from Axis-Streamer**

1. Make sure that Axis-Streamer is receiving data from Axis-Neuron. TODO: finish this.

2. Make sure the firewall is not stopping UDP traffic from Axis-Streamer. TODO: finish this.

3. Make sure the ports that axis-streamer is sending data to are forwarded on your router.

Most users of axis-streamer will be connecting to the internet via a router. The router presents
a single IP address to the outside world, hiding the computers connected to the internet throught it.
These computers don't have an external IP address instead they are given an IP by the router (e.g. 192.168.1.x). When sending a packet of data to the outside world the router is able to keep track of which
device the request came from and match it to the response passing it back to the correct machine.However, if a packet is received from the outside world which doesn't have a corresponding request the
router is unable to correctly route the packet. This is known as NAT.

Axis-Streamer sends packets to a client in this manner so we need to manually tell the router which
ports we're expecting packets to be delivered to and ask it to route traffic to those ports to our
device. This is known as Port Forwarding or Port Mapping.

**Unity complaining about port reuse (not receiving data from axis-neuron but you are receiving data from the remote axis-streamer)**
1. This is most likely due to binding a UDP source to 0.0.0.0. Using this address (which is specified by default if no address is provided to bind the UDP socket to) will bind the UDP socket to ALL addresses blocking anything (Unity included) from binding to any port to receive data from axis-neuron.

**Axis-Streamer not receiving data from Axis-Neuron**

1. Check that your firewall is not blocking Axis-Neuron. TODO: how to do this?

2. Check the broadcast settings in Axis-Streamer. TODO: how to do this?