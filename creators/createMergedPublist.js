function mergeJSONFiles(file1, file2) {
  // Read the contents of the two JSON files
  const file1Contents = fs.readFileSync(file1, "utf-8");
  const file2Contents = fs.readFileSync(file2, "utf-8");

  // Parse the JSON data into objects
  const file1Object = JSON.parse(file1Contents);
  const file2Object = JSON.parse(file2Contents);

  // Merge the two objects
  const mergedObject = Object.assign(file1Object, file2Object);

  // Write the merged JSON data to a new file
  fs.writeFileSync("merged.json", JSON.stringify(mergedObject, null, 2));
}
