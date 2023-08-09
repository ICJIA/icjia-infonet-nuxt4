import content from "../../src/tabs.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
