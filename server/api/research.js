import content from "../../src/research.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
