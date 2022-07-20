# About

The Goldsmiths Mocap Streamer consists of objects for transmitting BVH data in real-time.

You can [download a pre-built version of our application](https://github.com/goldsmocap/axis-streamer/releases/latest). Alternatively, you can [build your own from our source code](/blob/main/README.md#making-a-release). (Please note: you will need to [deploy your own remote server](/tree/main/remote#deploying-to-digital-ocean) in any instance) 

This codebase is entirely open to forks and contributions via our [GitHub](https://github.com/goldsmocap/axis-streamer/), subject to our [MPL License](https://github.com/goldsmocap/axis-streamer/blob/main/LICENSE)

<!--- Using html to add CSS ID "gitBadge"--->
<a href="https://github.com/goldsmocap/mocap-streamer/issues" id="gitBadge">
      <img alt="Issues" src="https://img.shields.io/github/issues/goldsmocap/mocap-streamer?color=CCFF00" />
    </a>
 <a href="https://github.com/goldsmocap/mocap-streamer/pulls" id="gitBadge">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/goldsmocap/mocap-streamer?color=4200D9" />
    </a>
<a href="https://github.com/goldsmocap/axis-streamer/blob/main/LICENSE" id="gitBadge">
      <img alt="License" src="https://img.shields.io/github/license/goldsmocap/mocap-streamer?color=FF007B" />
    </a>


## Project Overview:

The streamer is essentially a Websockets wrapper for UDP data, allowing users to stream to ports over the web as though they were local. 

It works like this:


```mermaid
  flowchart TD;

    Suit([Motion-Capture Suit])--User Datagram Protocol 'UDP'-->
    LocalA(Local Server);

    LocalA(Local Server)--Websockets-->
    Remote[(Remote Server)]
    
    UI[/Web User-Interface/]--Control Data-->
    Remote[(Remote Server)]--Websockets-->
    Local(Local Server)--User Datagram Protocol 'UDP'--> 
    Client[/Rendering Engine/];


    
    click Local "https://github.com/goldsmocap/axis-streamer/blob/main/local/README.md" "See the README for the 'Local Server' component"
    click UI "https://github.com/goldsmocap/axis-streamer/blob/main/local-webui/README.md" "See the README for the 'Web UI' component"
    click Remote "https://github.com/goldsmocap/axis-streamer/blob/main/remote/README.md" "See the README for the 'Remote' component"
    
    %%click Suit...add docs for suit and set-up
    %%click Client...add docs for using external software with the streamer

```


# Development

## Project Setup

*Prerequisites: git, node, yarn*

1. Clone the project from github `git clone https://github.com/goldsmocap/mocap-streamer`

2. Navigate to the project root and install dependencies: `yarn`

## Run Locally

1. **Start the remote streamer.** 
   You can either:
   1. Run a server on `locahost` port `3000`: 

      Run `yarn remote dev` from the project root.
    

   2. [Deploy your own remote server](https://github.com/goldsmocap/axis-streamer/tree/main/remote#deploying-to-digital-ocean)

2. **Start the local streamer:** 
   
   In a new terminal, run `yarn local dev` from the project root.

    (This starts the UI and a local server running on `localhost` port `4000`.)

# Making a Release

*pre-requisites: node, node-pkg*

## Release Remote-Streamer

[Deploy your own remote server](https://github.com/goldsmocap/axis-streamer/tree/main/remote#deploying-to-digital-ocean)

## Release Local-Streamer

**NOTE** This will only build an installer for the platform you run it on. For example, if you are using a Windows machine it will create a windows executable.

1. Update the version in package.json

2. Run `yarn local prebuild`

3. Run `yarn local build`

4. Zip the folder created by build `release/<version_number>`

5. Rename the zip to `local_<version_number>-<platform>.zip`

6. Copy zip to release in github
