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

interface OfflineDetails<S extends string> {
  type: S;
}

interface SimpleConnectionDetails<S extends string> {
  type: S;
  address: string;
  port: number;
}

interface OptitrackConnectionDetails {
  type: "Optitrack";
  connectionType: "Multicast" | "Unicast";
  serverCommandPort: number;
  serverDataPort: number;
  serverAddress: string;
  localAddress: string;
  multicastAddress: string;
}

export type ProducerConnectionDetails =
  | OfflineDetails<"Development">
  | SimpleConnectionDetails<"AxisStudio" | "Vicon" | "Xsens" | "Development">
  | OptitrackConnectionDetails;
