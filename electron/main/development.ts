import * as Rx from "rxjs";
import { readFileSync } from "fs";

const exampleData = readFileSync("./assets/example-data.bvh", "utf-8").split(
  "\n"
);
const exampleDataFps = 150;

export function developmentObserver(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void
): Rx.Observable<Buffer> {
  let lastFrameIndex = 0;

  return new Rx.Observable<Buffer>((observer) => {
    setIntervalTimeout(
      setInterval(() => {
        const data = exampleData[lastFrameIndex];
        lastFrameIndex = (lastFrameIndex + 1) % exampleData.length;
        observer.next(Buffer.from(data, "utf-8"));
      }, 1000 / exampleDataFps)
    );
  });
}
