# Release notes

Changes in each version of `@velotype/velossr` published to [JSR](https://jsr.io/@velotype/velossr), newest first. Dates are JSR publish dates.

**Breaking** marks a change that can require updates to code that uses velossr.

## 0.0.11 — 2026-11-08

Attribute values now follow the same rules as Velotype in the browser.

- Fix: an attribute was written only when its value was truthy, so `alt=""`, `tabindex={0}`, `min={0}` and `value={0}` were left out. Every value other than `null` and `undefined` is now written, including `""` and `0`. `alt=""` renders as a bare `alt`, which browsers read as `alt=""`.
- **Breaking:** an `aria-` or `data-` boolean is written as `"true"` or `"false"`. `aria-hidden={true}` was a bare `aria-hidden`, which isn't a valid value, and `aria-expanded={false}` or `data-open={false}` were left out. A CSS selector such as `[data-open]` now matches `data-open={false}` too; use `[data-open="true"]` for the true case.
- Fix: a function that is not an event listener is left out, instead of writing its source.
- Fix: a style object leaves out `null` and `undefined` values (they were written as `color:null`), keeps custom property names as written (`--brandColor` was written as `--brand-color`), and writes `webkitLineClamp` as `-webkit-line-clamp`.

## 0.0.10 — 2026-10-15

- Fix: a `false` child was written as the text `false`, so `{condition && <div/>}` wrote `false` into the page when the condition was false. `false` now renders nothing, as `null` and `undefined` do, and as it does in Velotype. `true` is still written as text.

## 0.0.9 — 2026-10-11

- Fix (security): the strings in an Array returned by a `DynamicServerComponent`, its `onFail()`, or an `AsyncRenderObject` render function, such as a fragment (`<>{text}</>`), were written without escaping, so request data rendered that way could inject HTML. They are now escaped.
- Fix: the text of `<script>` and `<style>` elements was escaped as HTML (`<` as `&lt;`, `&` as `&amp;`), which browsers do not decode there, so scripts with `<`, `>`, or `&&` failed and CSS selectors with `>` did not apply. Their text is now written as is, except for the sequences that would end the element early: in a `<script>` the `<` of `</script` and `<!--` is written as `\u003c`, and in a `<style>` `</style` is written as `<\/style`. This also makes `JSON.stringify()` output safe to embed in a `<script>`.
- Fix: a string returned by a `StaticServerComponent` was escaped twice, so `a<b` showed as `a&lt;b`.
- Fix: `&` in attribute values (including style object values) was not escaped, so browsers decoded character references in them, such as `&lt;` to `<`.
- Text that Components return is escaped once, where it is written: as HTML text, or with the `<script>` and `<style>` rules when the Component is inside one. A `DynamicServerComponent` inside a `<script>` can write per-request data, such as JSON.
- New `ComponentText`, the type that velossr wraps Component text in until it is written.
- **Breaking:** an element, or the output of an `AsyncRenderObject`, inside a `<script>` or `<style>` is skipped and an error is logged. Before, an element was written as markup inside the script.

Versions before 0.0.9 are not covered here.
