# velossr

Server-side TSX: components render to HTML bytes once per request (streamed when async). The whole engine is `src/tsx/ssr-core.ts`; `src/jsx-runtime/jsx-runtime.ts` is the public surface (what `@velotype/velossr` exports); `readme.md` documents behaviour and is kept current with it; `tests/ssr_core.test.tsx` is the spec.

## Escaping, and how to opt out

- Text, attribute values and attribute names are escaped by default, once, where they are written. A Component's returned strings are wrapped in `ComponentText` until then.
- `<script>` and `<style>` text is written as is, except the sequences that would end the element early (readme, "Supports inline `<style>` and `<script>` tags").
- **Raw HTML / unescaped output / `innerHTML` / `dangerouslySetInnerHTML`: use `SafeText`** (`new SafeText(html)`, exported from `@velotype/velossr`). It is written byte for byte everywhere, including inside `<script>`/`<style>`. It is also how markup built outside velossr TSX - a plain `.ts` module, or code using another `jsxImportSource` - reaches a velossr page. The caller escapes anything that came from outside. readme, "Writes raw HTML with `SafeText`".

## Working here

- `deno task test` runs the tests; add a test beside the behaviour you change, in `tests/ssr_core.test.tsx`.
- A change to behaviour goes in `release-notes.md` under the next version, and in `readme.md` in the same change.
