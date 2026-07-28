const fs = require("fs");
const path = require("path");

const files = [
  "arrays",
  "strings",
  "linkedlist",
  "trees",
  "graphs",
  "binarysearch",
  "stack",
  "queue",
  "heap",
  "dp",
];

files.forEach((file) => {
  const filePath = path.join(__dirname, "data", `${file}.json`);

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  console.log(file, data.length);
});