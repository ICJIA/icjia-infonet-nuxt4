import content from "../../app/data/hub.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
