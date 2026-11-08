# velossr
SSR TSX framework

Velossr renders TSX to HTML on the server. There is no Virtual DOM diffing and no client runtime - components run once per request and produce bytes, either all at once or streamed as async pieces resolve.

## Setup

Point your `jsx` compiler options at velossr:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@velotype/velossr"
  }
}
```

## Basic properties of Velossr TSX

### Uses HTML Attributes

Velossr calls `setAttribute()`-equivalent string rendering, so you write TSX the same as if you were writing HTML.

```tsx
const divTag: ServerVNode = <div class="exampleClass">this is a div</div>
```

### Supports style objects

Style objects resolve camelCase keys to kebab-case CSS.

```tsx
const divTag: ServerVNode = <div style={{display: "inline", marginTop: "4px"}}>this is a div</div>
```

### Escapes text and attributes by default

Text, attribute values, and attribute names are escaped automatically, including the text that Components return (as a string, an Array, or a fragment). Text is escaped once, where it is written.

### Supports inline `<style>` and `<script>` tags

Write CSS and JS as plain template strings. Browsers do not decode character references (such as `&lt;`) inside `<style>` and `<script>`, so their text is written as is, with `<`, `>`, and `&` unchanged. Only the sequences that would end the element early are changed, in a way that reads the same in JavaScript and CSS strings: in a `<script>`, the `<` of `</script` and `<!--` is written as `\u003c`, and in a `<style>`, `</style` is written as `<\/style`.

```tsx
<style>{`
div > p { color: red; }
`}</style>
<script>{`
function greet(name) {
    if (name.length > 0 && name !== "</script>") {
        console.log("Hello " + name);
    }
}
`}</script>
```

This also makes JSON safe to embed, whatever its strings contain:

```tsx
<script type="application/json" id="page-data">{JSON.stringify(data)}</script>
```

A `DynamicServerComponent` inside a `<script>` or `<style>` has its text escaped the same way, so it can write per-request data. Elements, and the output of an `AsyncRenderObject` (which is escaped as HTML), cannot be placed inside a `<script>` or `<style>`: they are skipped, and an error is logged.

### Writes raw HTML with `SafeText`

`SafeText` is velossr's raw-HTML escape hatch - what other frameworks call `dangerouslySetInnerHTML`, `innerHTML` or unescaped output. A `SafeText` child is written exactly as given: no escaping as HTML text, and none of the `<script>` and `<style>` rules above either.

```tsx
import { SafeText } from "@velotype/velossr"

// Markup built elsewhere, such as an inline SVG kept as a string
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">...</svg>`

<a href="/">{new SafeText(LOGO_SVG)}Home</a>

// A Component may return one, too
const Logo: StaticServerComponent<EmptyAttrs> = () => new SafeText(LOGO_SVG)
```

Reach for it when the HTML already exists as a string, for example:

- **Markup shared by code that isn't TSX:** a plain `.ts` module, or one compiled with another `jsxImportSource`, can build the HTML and return a `SafeText` for velossr pages to place. A `.ts` file can't contain velossr TSX, so this is how it shares markup.
- **Inline SVG or other markup kept as strings:** icons, or a fragment rendered by another tool, such as Markdown converted to HTML.
- **A prerendered fragment** reused across pages.

**Everything in it is your responsibility.** Escape every value that came from outside the code yourself (`&`, `<`, `>` and `"`, plus `'` inside single-quoted attributes) before building the string, and never pass request data, user input or database text through unescaped. Inside a `<script>` or `<style>` it isn't protected either: a `SafeText` holding `</script>` ends the script. When the content isn't fixed markup, prefer plain TSX, which escapes for you.

## Types of Components

Create these objects as Tags in tsx `<tag></tag>`

### Static Components

A `StaticServerComponent` is a plain function that renders synchronously with no access to the request. Use it for markup that never depends on the request.

```tsx
const Greeting: StaticServerComponent<{name: string}> = function(attrs) {
    return <div>Hello {attrs.name}!</div>
}
```

### Dynamic Components

A `DynamicServerComponent` is a class with access to the `Request` and `context`, and can render sync or async. If rendering throws, `onFail()` is called instead so one failing component doesn't take down the rest of the page.

```tsx
class UserGreeting extends DynamicServerComponent<EmptyAttrs> {
    override async render(_attrs, _children, request: Request, context) {
        const user = await lookupUser(request, context)
        return <div>Hello {user.name}!</div>
    }
    override onFail() {
        return <div>Hello!</div>
    }
}
```

## Rendering

Prepare a page once (this can happen at module load, outside the request handler):

```tsx
const preparedPage = prepareHTMLVNodeForRendering(<Page/>)
```

Then render it per-request, either all at once or streamed as async components resolve:

```ts
// All at once
const response = new Response(await renderServerVNode(preparedPage, request, context).toArrayBuffer())

// Streamed - async DynamicServerComponents flush in place as they resolve
const response = new Response(renderServerVNode(preparedPage, request, context).toReadableStream())
```

## Example server

Velossr pairs naturally with [veloserver](https://jsr.io/@velotype/veloserver):

```tsx
import { type Context, Router, Server } from "jsr:@velotype/veloserver"
import { type EmptyAttrs, prepareHTMLVNodeForRendering, renderServerVNode, type StaticServerComponent } from "jsr:@velotype/velossr"

const Page: StaticServerComponent<EmptyAttrs> = function() {
    return <html><body><div>Hello velossr!</div></body></html>
}
const preparedPage = prepareHTMLVNodeForRendering(<Page/>)

const router = new Router<never>({})
router.get("/", function(request: Request, context: Context<never>) {
    const response = new Response(renderServerVNode(preparedPage, request, context).toReadableStream())
    response.headers.set("content-type", "text/html; charset=utf-8")
    return response
})

const server = new Server(router)
server.serve("127.0.0.1", 3000)
```

Run it with `deno run --allow-net --allow-sys server.tsx`.
