import content from "../../app/data/appRoutes.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
