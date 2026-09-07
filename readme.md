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

Text nodes, attribute values, and attribute names are all escaped automatically.

### Supports inline `<style>` and `<script>` tags

Write CSS and JS as plain template strings - content is still escaped, using rules appropriate for `<style>`/`<script>` contents rather than HTML text.

```tsx
<style>{`
#hello-div { color: red; }
`}</style>
<script>{`
function greet(name) {
    console.log("Hello " + name);
}
`}</script>
```

For the rare case where you need to emit raw, already-safe content that shouldn't be escaped at all, wrap it in `SafeText`.

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
import { App, Router, Context } from "jsr:@velotype/veloserver"
import { prepareHTMLVNodeForRendering, renderServerVNode } from "jsr:@velotype/velossr"

const Page: StaticServerComponent<EmptyAttrs> = function() {
    return <html><body><div>Hello velossr!</div></body></html>
}
const preparedPage = prepareHTMLVNodeForRendering(<Page/>)

const router = new Router()
router.get("/", function(request: Request, context: Context) {
    const response = new Response(renderServerVNode(preparedPage, request, context).toReadableStream())
    response.headers.set("content-type", "text/html; charset=utf-8")
    return response
})

const app = new App(router)
app.serve("127.0.0.1", 3000)
```
