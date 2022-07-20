# About

The Goldsmiths Mocap Streamer consists of objects for transmitting labelled bounding volume hierarchy (BVH) data over the web in real-time.

The codebase is entirely open to forks and contributions via our [GitHub](https://github.com/goldsmocap/axis-streamer/), subject to our [MPL License](https://github.com/goldsmocap/axis-streamer/blob/main/LICENSE)


<!-- Repo Card -->
[![Repo Stats Card](https://github-readme-stats.vercel.app/api/pin/?username=goldsmocap&repo=mocap-streamer)](https://github.com/goldsmocap/mocap-streamer) 


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



After [deploying your own remote server](https://github.com/goldsmocap/axis-streamer/tree/main/remote#deploying-to-digital-ocean) to host the data stream, you can either:

- [Download a pre-built version of our streaming application](https://github.com/goldsmocap/axis-streamer/releases/latest) (recommended) or,
- [Build your own from our source code](https://github.com/goldsmocap/axis-streamer/blob/main/README.md#making-a-release)

We also have a number of [quick start objects and guides for both Unreal and Unity](https://app.gitbook.com/o/MtYGZjwZQdzw3gS72cG9/home), though the streamer works with any engine that supports BVH streaming.

## Project Overview:

The streamer is essentially a Websockets wrapper for UDP data, allowing users to stream to ports over the web as though they were local. 

It works like this (click on an element to read more on its GitHub page):

<!--- the subgraph styling is handled by '.cluster rect 2' so I'm loading a 'dark' init theme to colour it grey while staying in markdown. Feel free to change once implementing in a website with stylesheets--->

```mermaid

%%{init: {'theme': 'dark', "flowchart" : { "curve" : "basis" } } }%%

  flowchart TD;

classDef streamerClass fill:#CCFF00, stroke-width:0px;
classDef userClass fill:#FF007B,stroke:#333,stroke-width:0px;
linkStyle default stroke:#4200D9,stroke-width:4px;


    Suit([Motion-Capture Suit]):::userClass--User Datagram Protocol 'UDP'-->
    LocalA(Local Server);



    subgraph streamer [Mocap Streamer Application]
        LocalA(Local Server):::streamerClass--Websockets-->
        Remote[(Remote Server)]:::streamerClass
        
        UI[/Web User-Interface/]:::streamerClass--Control Data-->
        Remote[(Remote Server)]--Websockets--> Local:::streamerClass
    end

    Local(Local Server)--User Datagram Protocol 'UDP'--> 
    Client[/Rendering Engine/]:::userClass;


    
    click Local "https://github.com/goldsmocap/axis-streamer/blob/main/local/README.md" "See the README for the 'Local Server' component"
    click UI "https://github.com/goldsmocap/axis-streamer/blob/main/local-webui/README.md" "See the README for the 'Web UI' component"
    click Remote "https://github.com/goldsmocap/axis-streamer/blob/main/remote/README.md" "See the README for the 'Remote' component"
    
    %%click Suit...add docs for suit and set-up
    %%click Client...add docs for using external software with the streamer

```

###Credits:

Flowchart built using [MermaidJS](https://mermaid-js.github.io/mermaid/#/). Repo stats using [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats#readme) API.