# Goodreads profile workflow

Automatically update your README with what you're currently reading—or any other Goodreads reading shelf of yours.

![goodreads-github-profile-update-v1](https://user-images.githubusercontent.com/1093032/112973602-d3662f80-9151-11eb-9a94-6c05eadba362.png)

### How to use
- Go to your repository
- Add the following section to your **README.md** file, you can give whatever title you want. Just make sure that you use `<!-- GOODREADS-LIST:START --><!-- GOODREADS-LIST:END -->` in your readme. The workflow will replace this comment with the actual list of currently reading books: 

```markdown
### Books I'm currently reading
<!-- GOODREADS-LIST:START -->
<!-- GOODREADS-LIST:END -->
```

- Create a folder named `.github` and create a `workflows` folder inside it if it doesn't exist.
- Create a new file named `goodreads-profile-workflow.yml` with the following contents inside the workflows folder:

```yaml
name: Latest book list from a goodreads
on:
  schedule: # Run workflow automatically
    # This will make it run every hour
    - cron: "0 * * * *"
    # Run workflow manually (without waiting for the cron to be called), through the Github Actions Workflow page directly
  workflow_dispatch:
jobs:
  update-readme-with-goodreads-books:
    name: Update this repo's README with what you're currently reading
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: zwacky/goodreads-profile-workflow@main
        with:
          # Replace this with your goodreads user id
          goodreads_user_id: "92930971"
          shelf: "currently-reading"
```

- Replace the above `goodreads_user_id` with yours. To find out your user ID go to "My Books" on Goodreads and you'll see it in the URL.
- Commit and wait for it to run automatically or you can also trigger it manually to see the result instantly. To trigger the workflow manually check out [this blog post](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) by GitHub.

### Inputs

Here are all the inputs you can change in your goodreads-profile-workflow.yml file under `steps[*].with`:

| Option | Default Value | Description | Required |
|--------|--------|--------|--------|
| `goodreads_user_id` | "" | The Goodreads account ID to fetch the books from. | Yes |
| `shelf` | "`currently-reading`" | The Goodreads shelf/list the books are in (default shelves: currently-reading, read, to-read) | No |
| `max_books_count` | "`10`" | Max count of books that will be taken from the shelf/list | No |
| `readme_file_path` | "`./README.md`" | Path of the readme file you want to update | No |
| `output_only` | "`false`" | Usually used together with local-run.js. Sets the generated array as `books` [output variable](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idoutputs) so that it can be consumed in other actions | No |
| `comment_tag_name` | "`GOODREADS-LIST`" | Overrides the default comment tag name (`<!-- GOODREADS-LIST:START --><!-- GOODREADS-LIST:END -->`). In case you want to run multiple instances over the same README | No |
| `template` | "`- [$title]($url) by $author (⭐️$average_rating)`" | The list template written in Markdown.<br><br>**Suported variables:**<br><ul><li>`$title`: Book title</li><li>`$url`: Goodreads URL of the book</li><li>`$author`: Book author</li><li>`$published`: Book's published year</li><li>`$average_rating`: Book's rating on Goodreads</li><li>`$my_rating`: User's rating of the book (from 1-5)</li><li>`$my_rating_stars`: User's rating of the book in emoji star (from ⭐️ to ⭐️⭐️⭐️⭐️⭐️)</li></ul>  | No |
| `sort_by_fields` | "" | Pipe ('\|') concatenated string containing fields to sort results. Each field can be prepended with '<' for ascending order or '>' for descending. If omitted it defaults to descending order.<br>Ex.  "`>user_rating\|>average_rating`" will sort first by user_rating and after by average_rating both in descendant order.

### More resources
- Check out gautamkrishnar's [blog-post-workflow](https://github.com/gautamkrishnar/blog-post-workflow) for another great update readme workflow
