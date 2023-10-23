import content from "../../src/dataAndPublications.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
