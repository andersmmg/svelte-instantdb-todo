// Instant Svelte Todo App
// https://instantdb.com/dash?s=main&t=home&app=1ed3f6ed-aec6-40ea-bc30-837299669627

import { i } from "@instantdb/core";
import { env } from "$env/dynamic/public";

const graph = i.graph(
  {
    "messages": i.entity({
      "createdAt": i.number(),
      "text": i.string(),
    }),
    "todos": i.entity({
      "createdAt": i.number(),
      "done": i.boolean(),
      "text": i.string(),
    }),
  },
  {}
);

export default graph;
