import content from "../../app/data/publist.json";

export default defineEventHandler((event) => {
  return {
    content,
  };
});
