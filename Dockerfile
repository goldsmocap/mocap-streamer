FROM node:14 as builder
RUN mkdir -p /usr/remote-streamer
COPY . /usr/remote-streamer/
WORKDIR /usr/remote-streamer
RUN yarn
RUN yarn shared build
RUN yarn remote build
EXPOSE 3000
CMD ["node", "remote/dist/index.js"]