FROM node:14 as builder
RUN mkdir -p /usr/axis-streamer
WORKDIR /usr/axis-streamer
COPY . /usr/axis-streamer/
RUN yarn
RUN yarn remote build

FROM node:14
RUN mkdir -p /usr/axis-streamer
WORKDIR /usr/axis-streamer
COPY --from=builder /usr/axis-streamer /usr/axis-streamer
EXPOSE 3000
CMD ["node", "remote/dist/index.js"]