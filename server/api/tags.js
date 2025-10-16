import content from "../../app/data/tags.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
