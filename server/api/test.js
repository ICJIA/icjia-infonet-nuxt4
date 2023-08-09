import content from "../../src/searchIndex.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
