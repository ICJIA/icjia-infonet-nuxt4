import content from "../../src/appRoutes.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
