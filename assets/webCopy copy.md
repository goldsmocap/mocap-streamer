

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

