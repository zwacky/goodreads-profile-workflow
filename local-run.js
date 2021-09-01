const process = require("process");
const path = require("path");
const fs = require("fs");

const template = `# My profile
## What I'm currently reading 📚
<!-- GOODREADS-LIST:START -->
<!-- GOODREADS-LIST:END -->

## Other contents
Test content
`;

fs.writeFile(path.join(__dirname, "test", "README.md"), template, () => {
  console.log("Written test file....");

	process.env.INPUT_GOODREADS_USER_ID = "92930971";
	process.env.INPUT_SHELF = "currently-reading";
	process.env.INPUT_MAX_BOOKS_COUNT = "10";
	// process.env.INPUT_SORT_BY_FIELDS = ">user_rating|>average_rating"
	process.env.INPUT_README_FILE_PATH = "./test/README.md";;
	process.env.INPUT_OUTPUT_ONLY = "true";
	process.env.INPUT_TEMPLATE = "- [$title]($url) by $author (⭐️$average_rating)";

  const testFile = process.env.DIST ? "./dist/index.js" : "./index.js";
  // console.log("Testing: ", testFile);
  require(testFile);
});
