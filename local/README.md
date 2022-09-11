# Current data flow via routes/flows (main flows udp)

``` 
Suit: UDP Sink

Local streamer: Udp Source (binary packet) -> Some processing via rxjs -> Websocket Sink

Remote: Websocket source -> websocket sink/share data

Local streamer: Websocket source -> Udp Sink

Realtime: Plugin udp source -> parsing -> model 

```

# Changing data flow

To make a new, hardcoded package in the backend (ie osc) clone the most similar folder (udp in this case) and change accordingly

To add a data transformer, write something (either hardcoded or factored out into its own flow) which takes any arbitrary data format, does a transform, then spits it out as usual:

```
Any -> f(x) -> any
```

Then place this in-between a source and sink. This should only happen once to the data. You dont want to transform your data twice! This can be done a number of ways, for example:

(Preferred method, processing is done clientside)

```
Local streamer: Udp Source (binary packet) -> Your TRANSFORM here -> Some processing via rxjs -> Websocket Sink

Remote: Websocket source -> websocket sink/share data

Local streamer: Websocket source -> Udp Sink
```

*OR*

(Not recommended, processing is done serverside)

```
Local streamer: Udp Source (binary packet) ->  Some processing via rxjs -> Websocket Sink

Remote: Websocket source -> Your TRANSFORM here -> websocket sink/share data

Local streamer: Websocket source -> Udp Sink
```

*OR*

(Not recommended, processing is done clientside, however could be useful when aasymettrical processing would be benefitial (for example, a receiver wants to process all the data they get in a specific way, without affecting the data of the original streams, or data received by other receivers.)

```
Local streamer: Udp Source (binary packet) ->  Some processing via rxjs -> Websocket Sink

Remote: Websocket source ->  websocket sink/share data

Local streamer: Websocket source -> Your TRANSFORM here -> Udp Sink

```


# Implementation:

Changing data type would be rather similar to the parts of the interface which communicate role or name from interface to backend…

1. Store data type (with sensible defaults but re-assignable by interface)
2. Change the become/unbecome sender and receiver code in the “remoteWs.ts” file to make flows with the transformations in the middle.

Notes:

Stringly messages are sent from the ipc renderer, backend uses cases (looking for these strings) to call a number of relevant functions. This can be used to rename the datatype

Web socket messages have been pseudotyped via a serialise function….(declared and typed in the messages.d.ts file)

The local folder of this project uses an electron-vite-vue boilerplate by github user caoxiemeihao. The documentation for this structure can be found below.





# Electron-vite-vue

[![awesome-vite](https://awesome.re/mentioned-badge.svg)](https://github.com/vitejs/awesome-vite)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/electron-vite-vue?style=flat)
![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/electron-vite-vue?color=fa6470&style=flat)
![GitHub forks](https://img.shields.io/github/forks/caoxiemeihao/electron-vite-vue?style=flat)


**English | [简体中文](README.zh-CN.md)**

🥳 Real simple `Electron` + `Vue` + `Vite` boilerplate.

## Quick Start

[![quick-start](https://asciinema.org/a/483731.svg)](https://asciinema.org/a/483731)

## Overview

This is a `Vite`-integrated `Electron` template built with simplification in mind.

The repo contains only the most basic files, dependencies and functionalities to ensure flexibility for various scenarios. 

You need a basic understanding of `Electron` and `Vite` to get started. But that's not mandatory - you can learn almost all the details by reading through the source code. Trust me, this repo is not that complex. 😋

## Directory

A `dist` folder will be generated everytime when `dev` or `build` command is executed. File structure of `dist` is identical to the `packages` directory to avoid any potential path calculation errors.

```tree
├
├── dist                      Will be generated following the structure of "packages" directory
├   ├── main
├   ├── preload
├   ├── renderer
├
├── scripts
├   ├── build.mjs             Build script -> npm run build
├   ├── watch.mjs             Develop script -> npm run dev
├
├── packages
├   ├── main                  Main-process source code
├       ├── vite.config.ts
├   ├── preload               Preload-script source code
├       ├── vite.config.ts
├   ├── renderer              Renderer-process source code
├       ├── vite.config.ts
├
```

## Learn About Electron-vue-vite

Used in main-process 👉 [electron-vite-boilerplate](https://github.com/caoxiemeihao/electron-vite-boilerplate)

Used in Renderer-process 👉 [electron-vite-boilerplate/tree/nodeIntegration](https://github.com/caoxiemeihao/electron-vite-boilerplate/tree/nodeIntegration)

**ES Modules**

- [execa](https://www.npmjs.com/package/execa)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [file-type](https://www.npmjs.com/package/file-type)

**Native Addons**

- [sqlite3](https://www.npmjs.com/package/sqlite3)
- [serialport](https://www.npmjs.com/package/serialport)

## Main window
<img width="400px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/electron-vue-vite/screenshot/electron-15.png" />

## <!-- Wechat | | -->请我喝杯下午茶 🥳

<div style="display:flex;">
  <!-- <img height="333px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/assets/wechat/group/qrcode.jpg" />
  &nbsp;&nbsp;&nbsp;&nbsp; -->
  <img height="333px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/assets/wechat/%24qrcode/%24.png" />
</div>

