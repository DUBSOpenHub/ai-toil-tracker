# Dashboard link previews

The dashboard includes static Open Graph and large-image card metadata in its
HTML head. Sharing crawlers can read it without running JavaScript.

`social-preview.png` is the 3600 x 1890 sharing image. Its editable source is
`social-preview.svg`; render that 1200 x 630 artwork at 3x resolution when changing the
design. The image explicitly labels its numbers as demo data, not live team
results. Keep the PNG below 2 MB and update both image alt-text tags if its
content changes.

The default artwork uses the dashboard's dark canvas, purple/cyan accents,
success green, and time-drain red. Keep these colors in sync when updating the
dashboard theme.

`social-preview-yc.svg` and `social-preview-yc.png` are a separate minimalist,
light-theme concept using the same product palette. They do not replace the
default sharing image or imply an affiliation with Y Combinator.

## Publishing

Publish the HTML and PNG together. Local previews are not publicly reachable by
sharing services. Existing shared links may retain a cached preview; use the
sharing service's refresh/inspection tool after deployment. Increase the image's
`?v=` value in the HTML and `scripts/update-dashboard-sharing.sh` when replacing
the artwork.

## Forks and custom domains

The **Dashboard Data** workflow refreshes the absolute page and image URLs for
the current repository. To do this manually:

```bash
REPO=your-org/your-repository bash scripts/update-dashboard-sharing.sh
```

The script supports project Pages sites, owner Pages sites, and a custom domain
in `docs/CNAME`. Set the repository Actions variable `PAGES_URL` to override the
site's base URL, including any path prefix. Do not include `/dashboard/`, a
query, or a fragment in that override.

The shipped graphic remains the same demo artwork on forks; URL adaptation does
not regenerate it from private or live issue data.
