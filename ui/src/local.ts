import type { Ref } from "vue";

import { computed, ref } from "vue";
import { match } from "ts-pattern";

export const nameOnRemote: Ref<string | undefined> = ref(undefined);
export const managingLocalServer = computed(() => (nameOnRemote.value ? true : false));

export function localJoin(remoteUrl: string, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:4000/api/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ remoteUrl, name }),
    })
      .then((res) => {
        match(res)
          .with({ status: 200 }, () => {
            console.log("💃 local server successfully joined remote.");
            nameOnRemote.value = name;
            resolve();
          })
          .otherwise(({ statusText }) => {
            console.log(`💀 error trying to get local server to join remote server.`, statusText);
            reject(statusText);
          });
      })
      .catch((err) => {
        console.log(`💀 error trying to get local server to join remote server.`);
        reject(err);
      });
  });
}
