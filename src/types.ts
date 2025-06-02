export type SegmentData = {
  id: string;
  posx: number;
  posy: number;
  posz: number;
  rotx: number;
  roty: number;
  rotz: number;
  rotw: number | null;
};

export interface SubjectData {
  name: string;
  segments: SegmentData[];
}

export type MessageMode = "data" | "mocap";

interface DevelopmentDetails {
  type: "Development";
}

export interface SimpleConnectionDetails<S extends string> {
  type: S;
  address: string;
  port: number;
}

export interface OptitrackConnectionDetails {
  type: "Optitrack";
  connectionType: "Multicast" | "Unicast";
  serverCommandPort: number;
  serverDataPort: number;
  serverAddress: string;
  localAddress: string;
  multicastAddress: string;
}

export type ProducerConnectionDetails =
  | DevelopmentDetails
  | SimpleConnectionDetails<"AxisStudio" | "Vicon" | "Xsens" | "Development">
  | OptitrackConnectionDetails;

export interface ConsumerConnectionDetails {
  address: string;
  port: number;
}
