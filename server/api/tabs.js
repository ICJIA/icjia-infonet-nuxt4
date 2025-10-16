import content from "../../app/data/tabs.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
