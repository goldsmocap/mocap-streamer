FROM node:14 as builder
RUN mkdir -p /usr/remote-streamer
COPY . /usr/remote-streamer/

WORKDIR /usr/remote-streamer/shared
RUN tsc 

WORKDIR /usr/remote-streamer
RUN yarn
RUN yarn remote build
EXPOSE 3000
CMD ["node", "remote/dist/index.js"]