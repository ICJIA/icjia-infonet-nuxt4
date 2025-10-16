import content from "../../app/data/dataAndPublications.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
