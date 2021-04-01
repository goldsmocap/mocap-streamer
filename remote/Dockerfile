FROM node:14

RUN mkdir -p /usr/axis-streamer
WORKDIR /usr/axis-streamer
COPY package.json /usr/axis-streamer/
RUN npm install

COPY . /usr/axis-streamer
RUN npm run build

EXPOSE 5000-5020/udp 7002/udp 8080
CMD ["npm", "run", "start"]