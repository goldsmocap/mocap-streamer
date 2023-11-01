import { Room } from "livekit-client";
import { reactive } from "vue";

interface Store {
  participantName: string;
  roomName: string;
  room?: Room | null;
}

export const store = reactive<Store>({
  participantName: "",
  roomName: "",
});
