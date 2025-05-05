import * as Rx from "rxjs";
import { readFileSync } from "fs";
import { bvhToSubjectData } from "./axisStudio.js";
import { SubjectData } from "../types.js";

const exampleData = readFileSync("./assets/example-data.bvh", "utf-8").split(
  "\n"
);
const exampleDataFps = 150;

export function developmentObserver(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void
): Rx.Observable<SubjectData[]> {
  let lastFrameIndex = 0;

  return new Rx.Observable<SubjectData[]>((observer) => {
    setIntervalTimeout(
      setInterval(() => {
        const data = exampleData[lastFrameIndex];
        lastFrameIndex = (lastFrameIndex + 1) % exampleData.length;
        observer.next(bvhToSubjectData(data));
      }, 1000 / exampleDataFps)
    );
  });
}
