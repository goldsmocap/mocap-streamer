export type SegmentData = {
  id: string;
  posx: number;
  posy: number;
  posz: number;
  rotx: number;
  roty: number;
  rotz: number;
};

export interface SubjectData {
  name: string;
  segments: SegmentData[];
}

export type MessageMode = "data" | "mocap";
