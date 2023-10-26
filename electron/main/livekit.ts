import { AccessToken } from "livekit-server-sdk";

export function createToken(
  roomName: string,
  participantName: string,
  apiKey: string,
  apiSecret: string
) {
  // if this room doesn't exist, it'll be automatically created when the first
  // client joins

  // identifier to be used for participant.
  // it's available as LocalParticipant.identity with livekit-client SDK

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return at.toJwt();
}

export async function fetchToken(roomName: string, participantName: string) {
  const baseUrl = "http://staging.mocapstreamer.com";
  const port = 8000;

  return await fetch(
    `${baseUrl}:${port}/getToken/${roomName}/${participantName}`
  )
    .then((res) => res.text())
    .catch((err) => {
      console.log(err);
    });
}
