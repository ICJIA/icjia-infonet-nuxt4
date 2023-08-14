import content from "../../src/tags.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
