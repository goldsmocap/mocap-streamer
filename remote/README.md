# Deploying your own remote server

## Architecture

The project uses a client-server architecture. The server-side part (i.e the remote server) is run using a docker image, which is in turn defined by a Dockerfile.

## Requirements

All you need is:
- A server with docker installed, and 
- The ability to SSH into that server ([You can read more about that here](https://www.digitalocean.com/community/tutorials/how-to-use-ssh-to-connect-to-a-remote-server))

## Deploying the vanilla server (no changes)

Set environment variable called $REMOTE_VERSION

(For example, this can be done in ubuntu by appending EXPORT REMOTE_VERSION=x.x.x to /etc/profile)

Copy *only* the docker-compose file to the server

Start up the server:

```docker-compose up```

To take the server down, run:

```docker-compose down```

(note: you can run either of these processes in the background with an optional ```d``` flag)

## Deploying a modified server (with changes)

Pull the repo to your local development machine as usual

Make your changes

Copy the updated codebase to a server with docker installed

[Build the docker image from within the server](https://github.com/goldsmocap/mocap-streamer/tree/main/remote/README.md#building-a-docker-image)

[Run the container from within the server](https://github.com/goldsmocap/mocap-streamer/tree/main/remote/README.md#running-a-docker-container)


## Building a Docker Image

You can build your own docker image with the following template

`docker build -t [NAME OF IMAGE] [FILEPATH]`

for example, using our root directory Dockerfile, you would run:

`docker build -t mocap-streamer goldsmithsmocap/mocap-streamer`

## Running a Docker Container

Then, the resultant image must be referenced to run a docker image.

(The docker container must be run using the host's network hence the `--network host` option.)

`sudo docker run -d --network host --name mocap-streamer goldsmithsmocap/mocap-streamer:<tag>`

Run this part on your remote server. We are using digital ocean, but you can use whatever you like!

# Troubleshooting Server Connections

**Unity not picking up data stream from Axis-Streamer**

1. Make sure that Mocap-Streamer is receiving data from Axis-Neuron.

2. Make sure the firewall is not stopping UDP traffic from Mocap-Streamer.
   
3. Make sure the ports that Mocap-Streamer is sending data to are forwarded on your router.

Most users of Mocap-Streamer will be connecting to the internet via a router. The router presents
a single IP address to the outside world, hiding the computers connected to the internet through it.
These computers don't have an external IP address instead they are given an IP by the router (e.g. 192.168.1.x). When sending a packet of data to the outside world the router is able to keep track of which
device the request came from and match it to the response passing it back to the correct machine.However, if a packet is received from the outside world which doesn't have a corresponding request the
router is unable to correctly route the packet. This is known as NAT.

Mocap-Streamer sends packets to a client in this manner so we need to manually tell the router which
ports we're expecting packets to be delivered to and ask it to route traffic to those ports to our
device. This is known as Port Forwarding or Port Mapping.


**Mocap-Streamer not receiving data from Axis-Neuron**

1. Check that your firewall is not blocking Axis-Neuron.

2. Check the broadcast settings in Axis-Neuron. 
