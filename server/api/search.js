import content from "../../app/data/searchIndex.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
