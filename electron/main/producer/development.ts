import { readFileSync } from "fs";
import * as Rx from "rxjs";

import { SubjectData } from "../types.js";
import { bvhToSubjectData } from "./axisStudio.js";

const exampleData = readFileSync("./assets/example-data.bvh", "utf-8").split(
  "\n"
);
const exampleDataFps = 150;

export function developmentObserver(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void
): Rx.Observable<SubjectData[]> {
  const startTime = Date.now();

  return new Rx.Observable<SubjectData[]>((observer) => {
    setIntervalTimeout(
      setInterval(() => {
        const framesSinceStart = (Date.now() - startTime) * exampleDataFps;
        const frameIndex = Math.floor(framesSinceStart) % exampleData.length;

        observer.next(bvhToSubjectData(exampleData[frameIndex]));
      }, 1000 / exampleDataFps)
    );
  });
}
