# Dashboard link previews

The dashboard includes static Open Graph and large-image card metadata in its
HTML head. Sharing crawlers can read it without running JavaScript.

`social-preview-yc.png` is the selected 3600 x 1890 sharing image and README
presentation graphic. Its editable source is `social-preview-yc.svg`; render that
1200 x 630 artwork at 3x resolution when changing the
design. The image explicitly labels its numbers as demo data, not live team
results. Keep the PNG below 2 MB and update both image alt-text tags if its
content changes.

The selected artwork uses a light canvas with the approved red headline and the
dashboard's product palette. Its historical `-yc` filename does not imply an
affiliation with Y Combinator.

`social-preview.svg` and `social-preview.png` retain the alternative dark design,
using the dashboard's dark canvas, purple/cyan accents, success green, and
time-drain red. Keep these colors in sync when updating the dashboard theme.

The sample tasks mix engineering and security work with product roadmap updates,
program status updates, and meeting follow-ups. The artwork uses team-oriented
display labels for these same tasks. Preserve each SVG's `data-issue` mapping,
team label, ranking, and effort when adjusting that wording; the source records
remain in `dashboard-data.json` and the embedded `DEMO_DATA` in `index.html`.
Keep the headline and supporting copy consistent between both previews, and
write "GitHub Copilot" in full.

Keep "slowing your team down" consistently red (`#ff4d6d`) and balance the subtitle
across two equal-width lines. The light headline fills a 540px-wide block using
proportionally sized letterforms, not stretched glyphs. Balance the visible gaps
between its lines, keep the product wordmark legible at 30px, and keep the subtitle
and button close without crowding them.
The light preview has no top-right "OPEN SOURCE" badge or standalone savings
callout. Its task bars show remaining monthly effort, not savings. Keep the
underlying dashboard metrics unchanged when adjusting artwork; the task rows
name their functions, and "DEMO DATA" identifies the illustrative figures.

Transparent dark-text and white-text logos are available in `../assets/brand/`
as PNG and SVG files. Use the PNGs directly in presentations; the SVGs retain
the editable icon and wordmark.

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
