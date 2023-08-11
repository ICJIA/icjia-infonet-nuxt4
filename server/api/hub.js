import content from "../../src/hub.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
