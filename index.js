// credits to https://github.com/gautamkrishnar/blog-post-workflow

const https = require("https");
const fs = require("fs");
const core = require("@actions/core");
const parser = require("fast-xml-parser");
const exec = require("./exec");

const GOODREADS_USER_ID = core.getInput("goodreads_user_id");
const SHELF = core.getInput("shelf");
const MAX_BOOKS_COUNT = Number.parseInt(core.getInput("max_books_count"));
const README_FILE_PATH = core.getInput("readme_file_path");
const OUTPUT_ONLY = core.getInput("output_only").toLowerCase() === "true";
const COMMIT_MESSAGE = "Synced and updated with user's goodreads book lists";
const COMMITTER_USERNAME = "goodreads-books-bot";
const COMMITTER_EMAIL = "goodreads-books-bot@example.com";

requestList(GOODREADS_USER_ID, SHELF)
  .then(async (data) => {
    try {
      const books = data.rss.channel.item.slice(0, MAX_BOOKS_COUNT);
      const readme = fs.readFileSync(README_FILE_PATH, "utf8");
      const updatedReadme = buildReadme(readme, books);
      if (readme !== updatedReadme) {
        core.info(`Writing to ${README_FILE_PATH}`);
        // output the books in the logs
        core.startGroup("New books found for update");
        books.forEach((book) => core.info(JSON.stringify(book)));
        core.endGroup();

        fs.writeFileSync(README_FILE_PATH, updatedReadme);

        if (!OUTPUT_ONLY) {
          await commitReadme();
        } else {
          core.setOutput("books", books);
          core.info(
            "OUTPUT_ONLY: set `results` variable. Readme not committed."
          );
        }
      }
    } catch (err) {
      core.error(err);
      process.exit(1);
    }
  })
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    // maybe GOODREADS_USER_ID, SHELF or goodreads itself is not available
    core.error(err);
    process.exit(1);
  });

function requestList(userId, shelf) {
  return new Promise((resolve, reject) => {
    https
      .request(
        {
          host: "www.goodreads.com",
          path: `/review/list_rss/${userId}?shelf=${shelf}`,
        },
        (response) => {
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => resolve(parser.parse(data)));
          response.on("error", (err) => reject(err));
        }
      )
      .end();
  });
}

function buildReadme(template, books) {
  const tagName = core.getInput("comment_tag_name") || "GOODREADS-LIST";
  const startTag = `<!-- ${tagName}:START -->`;
  const endTag = `<!-- ${tagName}:END -->`;

  const hasRequiredComments = [startTag, endTag].every((tag) =>
    template.match(new RegExp(tag, "gm"))
  );

  if (!hasRequiredComments) {
    core.error(
      `Cannot find the required comment tags (${startTag} and ${endTag}) to inject book titles.`
    );
    process.exit(1);
  } else {
    const startIndex = template.indexOf(startTag);
    const endIndex = template.indexOf(endTag);
    const replaceContent = buildBookList(books);
    return [
      template.substring(0 + startTag.length, startIndex),
      replaceContent,
      template.substring(endIndex),
    ].join("");
  }
}

function buildBookList(books) {
  return books
    .map((book) => `- [${book.title}](${book.link}) by ${book.author_name}`)
    .join(`\n`);
}

async function commitReadme() {
  // Doing commit and push
  await exec("git", ["config", "--global", "user.email", COMMITTER_EMAIL]);
  await exec("git", ["config", "--global", "user.name", COMMITTER_USERNAME]);
  await exec("git", ["add", README_FILE_PATH]);
  await exec("git", ["commit", "-m", COMMIT_MESSAGE]);
  await exec("git", ["push"]);
  core.info("Readme updated successfully in the upstream repository");
  // Making job fail if one of the source fails
  process.exit(0);
}
