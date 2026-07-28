const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Question = require("./models/Question");

const questions = [
  // ── JavaScript ──
  {
    topic: "JavaScript", difficulty: "Easy",
    question: "Which keyword is used to declare a block-scoped variable in JavaScript?",
    options: ["var", "let", "define", "declare"],
    correctAnswer: 1,
    explanation: "'let' declares a block-scoped variable, unlike 'var' which is function-scoped.",
  },
  {
    topic: "JavaScript", difficulty: "Easy",
    question: "What does '===' check in JavaScript?",
    options: ["Only value", "Only type", "Both value and type", "Neither"],
    correctAnswer: 2,
    explanation: "'===' is strict equality — checks both value and type without coercion.",
  },
  {
    topic: "JavaScript", difficulty: "Easy",
    question: "What is the output of typeof null in JavaScript?",
    options: ["null", "undefined", "object", "string"],
    correctAnswer: 2,
    explanation: "typeof null returns 'object' — this is a known JavaScript bug that was never fixed.",
  },
  {
    topic: "JavaScript", difficulty: "Easy",
    question: "Which array method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: 0,
    explanation: "push() adds one or more elements to the end of an array.",
  },
  {
    topic: "JavaScript", difficulty: "Easy",
    question: "What does the 'this' keyword refer to inside an arrow function?",
    options: [
      "The function itself",
      "The global object",
      "The enclosing lexical context",
      "undefined",
    ],
    correctAnswer: 2,
    explanation: "Arrow functions don't have their own 'this' — they inherit it from the enclosing scope.",
  },
  {
    topic: "JavaScript", difficulty: "Medium",
    question: "What is a closure in JavaScript?",
    options: [
      "A function that returns another function",
      "A function that has access to its outer scope even after the outer function returns",
      "A method to close a browser window",
      "A way to end a loop",
    ],
    correctAnswer: 1,
    explanation: "A closure is a function that retains access to its outer scope variables even after the outer function has returned.",
  },
  {
    topic: "JavaScript", difficulty: "Medium",
    question: "What is the purpose of Promise.all()?",
    options: [
      "Runs promises one by one",
      "Runs all promises in parallel and waits for all to resolve",
      "Returns the first resolved promise",
      "Catches errors from all promises",
    ],
    correctAnswer: 1,
    explanation: "Promise.all() takes an array of promises and resolves when ALL of them resolve, or rejects if any one rejects.",
  },
  {
    topic: "JavaScript", difficulty: "Hard",
    question: "What is the event loop in JavaScript?",
    options: [
      "A loop that handles DOM events",
      "A mechanism that allows JavaScript to perform non-blocking operations",
      "A for loop used for event listeners",
      "A way to create infinite loops",
    ],
    correctAnswer: 1,
    explanation: "The event loop enables JavaScript's non-blocking I/O by offloading operations to the system kernel and processing callbacks in the call stack.",
  },

  // ── Data Structures ──
  {
    topic: "Data Structures", difficulty: "Easy",
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctAnswer: 2,
    explanation: "Array access by index is O(1) — direct memory address calculation.",
  },
  {
    topic: "Data Structures", difficulty: "Easy",
    question: "Which data structure follows LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: 1,
    explanation: "A Stack follows LIFO — the last element inserted is the first one removed.",
  },
  {
    topic: "Data Structures", difficulty: "Easy",
    question: "Which data structure follows FIFO (First In First Out)?",
    options: ["Stack", "Tree", "Queue", "Graph"],
    correctAnswer: 2,
    explanation: "A Queue follows FIFO — the first element inserted is the first one removed.",
  },
  {
    topic: "Data Structures", difficulty: "Medium",
    question: "What is the worst-case time complexity of searching in a Binary Search Tree?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "In the worst case (unbalanced BST), searching becomes O(n) — essentially a linked list.",
  },
  {
    topic: "Data Structures", difficulty: "Medium",
    question: "What is the space complexity of a Hash Table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
    explanation: "A hash table uses O(n) space to store n key-value pairs.",
  },
  {
    topic: "Data Structures", difficulty: "Hard",
    question: "What is the time complexity of inserting into a max-heap?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "Insertion into a heap is O(log n) because we may need to bubble up the element to maintain the heap property.",
  },

  // ── Algorithms ──
  {
    topic: "Algorithms", difficulty: "Easy",
    question: "What is the best-case time complexity of Bubble Sort?",
    options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
    correctAnswer: 2,
    explanation: "With an optimized bubble sort, if the array is already sorted, it's O(n) — one pass with no swaps.",
  },
  {
    topic: "Algorithms", difficulty: "Easy",
    question: "Binary Search requires the array to be:",
    options: ["Unsorted", "Sorted", "Contains unique elements", "Contains integers only"],
    correctAnswer: 1,
    explanation: "Binary search works by repeatedly halving the search space — this only works on sorted arrays.",
  },
  {
    topic: "Algorithms", difficulty: "Medium",
    question: "What algorithmic paradigm does Merge Sort use?",
    options: ["Greedy", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
    correctAnswer: 2,
    explanation: "Merge sort divides the array in half, recursively sorts each half, then merges them — classic Divide and Conquer.",
  },
  {
    topic: "Algorithms", difficulty: "Medium",
    question: "What is the time complexity of Dijkstra's algorithm using a min-heap?",
    options: ["O(V²)", "O(E log V)", "O(V log V)", "O(E + V)"],
    correctAnswer: 1,
    explanation: "With a binary min-heap, Dijkstra runs in O((V + E) log V), simplified to O(E log V) for connected graphs.",
  },
  {
    topic: "Algorithms", difficulty: "Hard",
    question: "Which of the following problems is NP-Complete?",
    options: ["Binary Search", "Merge Sort", "Travelling Salesman Problem", "Dijkstra's Shortest Path"],
    correctAnswer: 2,
    explanation: "The Travelling Salesman Problem (decision version) is NP-Complete — no known polynomial-time solution exists.",
  },

  // ── OOP Concepts ──
  {
    topic: "OOP Concepts", difficulty: "Easy",
    question: "Which OOP principle hides the internal details of an object?",
    options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
    correctAnswer: 2,
    explanation: "Encapsulation bundles data and methods together and restricts direct access to internal state.",
  },
  {
    topic: "OOP Concepts", difficulty: "Easy",
    question: "What is inheritance in OOP?",
    options: [
      "A class hiding its data",
      "A class acquiring properties of another class",
      "A function calling itself",
      "Creating multiple objects",
    ],
    correctAnswer: 1,
    explanation: "Inheritance allows a child class to inherit properties and methods from a parent class, promoting code reuse.",
  },
  {
    topic: "OOP Concepts", difficulty: "Medium",
    question: "What is method overriding?",
    options: [
      "Defining multiple methods with same name but different parameters",
      "A child class providing its own implementation of a parent class method",
      "Hiding a method from outside classes",
      "Calling a method multiple times",
    ],
    correctAnswer: 1,
    explanation: "Method overriding allows a subclass to provide a specific implementation of a method already defined in its parent class.",
  },

  // ── Database ──
  {
    topic: "Database", difficulty: "Easy",
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Query Language",
      "Standard Query Logic",
      "Stored Query Library",
    ],
    correctAnswer: 0,
    explanation: "SQL stands for Structured Query Language — used to manage relational databases.",
  },
  {
    topic: "Database", difficulty: "Easy",
    question: "Which SQL command is used to retrieve data from a table?",
    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
    correctAnswer: 2,
    explanation: "SELECT is used to query and retrieve data from one or more tables.",
  },
  {
    topic: "Database", difficulty: "Medium",
    question: "What is a PRIMARY KEY in a database?",
    options: [
      "A key that can have duplicate values",
      "A key that uniquely identifies each record in a table",
      "A foreign reference to another table",
      "An index for faster search",
    ],
    correctAnswer: 1,
    explanation: "A PRIMARY KEY uniquely identifies each row in a table — it must be unique and cannot be NULL.",
  },
  {
    topic: "Database", difficulty: "Medium",
    question: "What type of database is MongoDB?",
    options: ["Relational", "Graph", "Document-oriented NoSQL", "Key-Value"],
    correctAnswer: 2,
    explanation: "MongoDB is a document-oriented NoSQL database that stores data in flexible JSON-like BSON documents.",
  },

  // ── Operating Systems ──
  {
    topic: "Operating Systems", difficulty: "Easy",
    question: "What is a process in an operating system?",
    options: [
      "A program stored on disk",
      "A program in execution",
      "A hardware component",
      "A file in memory",
    ],
    correctAnswer: 1,
    explanation: "A process is a program in execution — it includes the program code, current activity, and allocated resources.",
  },
  {
    topic: "Operating Systems", difficulty: "Medium",
    question: "What is deadlock in OS?",
    options: [
      "When a process runs too fast",
      "When two or more processes wait indefinitely for resources held by each other",
      "When memory runs out",
      "When CPU utilization reaches 100%",
    ],
    correctAnswer: 1,
    explanation: "Deadlock occurs when a set of processes are permanently blocked, each waiting for a resource held by another.",
  },

  // ── Computer Networks ──
  {
    topic: "Computer Networks", difficulty: "Easy",
    question: "What does HTTP stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High Transfer Text Process",
      "Hyperlink Text Transmission Protocol",
      "Host Transfer Technology Protocol",
    ],
    correctAnswer: 0,
    explanation: "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web.",
  },
  {
    topic: "Computer Networks", difficulty: "Easy",
    question: "Which layer of the OSI model handles routing?",
    options: ["Physical", "Data Link", "Network", "Transport"],
    correctAnswer: 2,
    explanation: "The Network layer (Layer 3) handles logical addressing and routing of packets between networks.",
  },
  {
    topic: "Computer Networks", difficulty: "Medium",
    question: "What is the difference between TCP and UDP?",
    options: [
      "TCP is faster, UDP is reliable",
      "TCP is connection-oriented and reliable; UDP is connectionless and faster",
      "They are the same protocol",
      "UDP is used for web browsing, TCP for video",
    ],
    correctAnswer: 1,
    explanation: "TCP provides reliable, ordered delivery with error checking. UDP is faster but does not guarantee delivery or order.",
  },

  // ── System Design ──
  {
    topic: "System Design", difficulty: "Medium",
    question: "What is horizontal scaling?",
    options: [
      "Upgrading existing server hardware",
      "Adding more servers to distribute load",
      "Increasing RAM of a single server",
      "Reducing the number of database tables",
    ],
    correctAnswer: 1,
    explanation: "Horizontal scaling (scaling out) means adding more machines to a pool of resources, distributing the load.",
  },
  {
    topic: "System Design", difficulty: "Medium",
    question: "What is the purpose of a Load Balancer?",
    options: [
      "Store user sessions",
      "Distribute incoming traffic across multiple servers",
      "Compress data for storage",
      "Encrypt network communication",
    ],
    correctAnswer: 1,
    explanation: "A load balancer distributes incoming network traffic across multiple backend servers to ensure no single server is overwhelmed.",
  },
  {
    topic: "System Design", difficulty: "Hard",
    question: "What is the CAP theorem?",
    options: [
      "A theorem about CPU, API, and Performance",
      "A distributed system can only guarantee 2 of: Consistency, Availability, Partition Tolerance",
      "A caching strategy for databases",
      "A method to calculate system capacity",
    ],
    correctAnswer: 1,
    explanation: "CAP theorem states a distributed system cannot simultaneously provide all three: Consistency, Availability, and Partition Tolerance.",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    await Question.deleteMany({});
    console.log("Old questions cleared");

    await Question.insertMany(questions);
    console.log(`${questions.length} questions seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();