# Project Overview:

## Sending and Receiving Data:
```mermaid
  flowchart TD;

    Suit([Motion-Capture Suit])--User Datagram Protocol 'UDP'-->
    Local(Local Server);
    
    UI[/Web User-Interface/]--Control Data-->
    Remote[(Remote Server)]<--Websockets-->
    Local(Local Server)--User Datagram Protocol 'UDP'--> 
    Client[/Streaming Client/];
    click Client "http://www.github.com" "This is a tooltip for a link"

```

## Sending Data:
```mermaid
  flowchart TD;

    Suit([Motion-Capture Suit])--User Datagram Protocol 'UDP'-->
    Local(Local Server)--Websockets-->
    Remote[(Remote Server)];

    UIUI[/Web User-Interface/]--Control Data-->Remote; 

```

## Receiving Data:
```mermaid
  flowchart TD;

    UI[/Web User-Interface/]--Control Data-->
    Remote[(Remote Server)]--Websockets-->
    Local(Local Server) -- User Datagram Protocol 'UDP'--> 
    Client[/Streaming Client/];
    
```

