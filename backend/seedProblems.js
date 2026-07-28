const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const Problem = require("./models/Problem");

const topicMap = {
  arrays: "Arrays",
  strings: "Strings",
  linkedlist: "Linked List",
  trees: "Trees",
  graphs: "Graphs",
  binarysearch: "Binary Search",
  dp: "Dynamic Programming",
  heap: "Heap",
  queue: "Queue",
  stack: "Stack",
};

const importData = async () => {
  try {
    await connectDB();

    console.log("🗑 Clearing old problems...");
    await Problem.deleteMany();

    const dataFolder = path.join(__dirname, "data");

    const files = fs
      .readdirSync(dataFolder)
      .filter((file) => file.endsWith(".json"));

    let allProblems = [];

    for (const file of files) {
      const filePath = path.join(dataFolder, file);

      const rawData = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      const topicKey = path.basename(file, ".json");

      const topic =
        topicMap[topicKey] ||
        topicKey.charAt(0).toUpperCase() + topicKey.slice(1);

      const formatted = rawData.map((problem) => ({
        ...problem,
        topic,
      }));

      allProblems.push(...formatted);

      console.log(
        `✅ ${file} -> ${formatted.length} problems`
      );
    }

    await Problem.insertMany(allProblems);

    console.log(
      `\n🎉 Successfully imported ${allProblems.length} problems`
    );

    process.exit(0);
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

importData();