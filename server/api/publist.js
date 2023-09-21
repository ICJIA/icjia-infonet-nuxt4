import content from "../../src/publist.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
