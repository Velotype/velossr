/// <reference lib="deno.ns" />

// deno-lint-ignore-file no-explicit-any

import { describe, it } from "@std/testing/bdd"
import { assertEquals } from "@std/assert"

import {
    createElement,
    prepareVNodeForRendering,
    prepareHTMLVNodeForRendering,
    renderServerVNode,
    SafeText,
    DynamicServerComponent,
    AsyncRenderObject,
    type EmptyAttrs,
    type ServerVNode,
} from "@velotype/velossr/jsx-runtime"

const decoder = new TextDecoder()

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/** Render a raw (unprepared) ServerVNode straight to a string - this is the same path a DynamicServerComponent's own render() return value goes through. */
async function renderToString(node: ServerVNode, request: Request = new Request("http://localhost/"), context: any = {}): Promise<string> {
    const bytes = await renderServerVNode(node, request, context).toArrayBuffer()
    return decoder.decode(bytes)
}

describe("HTML text escaping", () => {
    it("escapes quote, ampersand, and less-than but leaves greater-than untouched in text nodes", async () => {
        const html = await renderToString(<div>{'a " b & c < d > e'}</div>)
        assertEquals(html, '<div>a &quot; b &amp; c &lt; d > e</div>')
    })
    it("leaves plain text with no special characters untouched", async () => {
        const html = await renderToString(<div>plain text</div>)
        assertEquals(html, "<div>plain text</div>")
    })
})

describe("HTML attribute rendering", () => {
    it("escapes quotes in attribute values", async () => {
        const html = await renderToString(<div title='say "hi"'></div>)
        assertEquals(html, '<div title="say &quot;hi&quot;"></div>')
    })
    it("strips invalid characters from attribute names", async () => {
        const html = await renderToString(createElement("div", { "bad name!": "x" }, []))
        assertEquals(html, '<div badname="x"></div>')
    })
    it("omits event listener attributes instead of throwing", async () => {
        const html = await renderToString(createElement("button", { onClick: () => {} }, ["click me"]))
        assertEquals(html, "<button>click me</button>")
    })
    it("renders a true boolean attribute bare and omits a false one", async () => {
        const html = await renderToString(createElement("input", { disabled: true, required: false }, []))
        assertEquals(html, "<input disabled>")
    })
    it("converts a style object from camelCase keys to kebab-case css", async () => {
        const html = await renderToString(<div style={{ display: "flex", marginTop: 4 }}></div>)
        assertEquals(html, '<div style="display:flex;margin-top:4"></div>')
    })
})

describe("void elements", () => {
    it("self-closes void elements with no children and no closing tag", async () => {
        const html = await renderToString(<div><img src="a.png" alt="x" /><br /></div>)
        assertEquals(html, '<div><img src="a.png" alt="x"><br></div>')
    })
})

describe("children handling", () => {
    it("drops null and undefined children without a trace", async () => {
        const html = await renderToString(<div>{null}before{undefined}after{null}</div>)
        assertEquals(html, "<div>beforeafter</div>")
    })
    it("flattens nested arrays and fragments", async () => {
        const html = await renderToString(<div>{[["a", ["b"]], <>{"c"}</>]}</div>)
        assertEquals(html, "<div>abc</div>")
    })
})

describe("SafeText", () => {
    it("passes text through completely unescaped", async () => {
        const html = await renderToString(<div>{new SafeText("<b>&raw</b>")}</div>)
        assertEquals(html, "<div><b>&raw</b></div>")
    })
})

describe("DynamicServerComponent", () => {
    class SyncComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(): ServerVNode {
            return <span id="sync">sync value</span>
        }
    }
    it("renders a component whose render() returns synchronously", async () => {
        const html = await renderToString(<div><SyncComponent /></div>)
        assertEquals(html, '<div><span id="sync">sync value</span></div>')
    })

    class AsyncComponent extends DynamicServerComponent<EmptyAttrs> {
        override async render(): Promise<ServerVNode> {
            await sleep(10)
            return <span id="async">async value</span>
        }
    }
    it("renders a component whose render() resolves asynchronously", async () => {
        const html = await renderToString(<div><AsyncComponent /></div>)
        assertEquals(html, '<div><span id="async">async value</span></div>')
    })

    class SyncThrowComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(): ServerVNode {
            // Thrown directly, not via a rejected Promise - render() is not async here.
            throw new Error("synchronous failure")
        }
        override onFail(): ServerVNode {
            return <span id="fallback">sync fallback</span>
        }
    }
    it("catches a genuinely synchronous throw from render() and calls onFail()", async () => {
        const html = await renderToString(<div><SyncThrowComponent /></div>)
        assertEquals(html, '<div><span id="fallback">sync fallback</span></div>')
    })

    class AsyncThrowComponent extends DynamicServerComponent<EmptyAttrs> {
        override async render(): Promise<ServerVNode> {
            await sleep(10)
            throw new Error("async failure")
        }
        override onFail(): ServerVNode {
            return <span id="fallback">async fallback</span>
        }
    }
    it("catches an asynchronous rejection from render() and calls onFail()", async () => {
        const html = await renderToString(<div><AsyncThrowComponent /></div>)
        assertEquals(html, '<div><span id="fallback">async fallback</span></div>')
    })

    class DefaultOnFailComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(): ServerVNode {
            throw new Error("no custom onFail")
        }
    }
    it("renders nothing when onFail() is not overridden", async () => {
        const html = await renderToString(<div id="wrap"><DefaultOnFailComponent /></div>)
        assertEquals(html, '<div id="wrap"></div>')
    })

    it("isolates a failing component from its siblings", async () => {
        const html = await renderToString(<div>
            <span id="before">before</span>
            <SyncThrowComponent />
            <span id="after">after</span>
        </div>)
        assertEquals(html, '<div><span id="before">before</span><span id="fallback">sync fallback</span><span id="after">after</span></div>')
    })

    class RequestEchoComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], request: Request): ServerVNode {
            return <span id="url">{request.url}</span>
        }
    }
    it("gives render() access to the real Request", async () => {
        const html = await renderToString(<RequestEchoComponent />, new Request("http://localhost/some/path"))
        assertEquals(html, '<span id="url">http://localhost/some/path</span>')
    })

    class ContextEchoComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, context: any): ServerVNode {
            return <span id="ctx">{context.value}</span>
        }
    }
    it("gives render() access to the real context", async () => {
        const html = await renderToString(<ContextEchoComponent />, undefined, { value: "ctx-value" })
        assertEquals(html, '<span id="ctx">ctx-value</span>')
    })
})

describe("AsyncRenderObject", () => {
    class SharedValueComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], request: Request, context: any): ServerVNode {
            const shared = new AsyncRenderObject<string>(
                (async () => { await sleep(10); return "shared" })(),
                request,
                context,
            )
            return <div>
                <span id="one">{shared.render((data) => Promise.resolve(<>{data}-one</>))}</span>
                <span id="two">{shared.render((data) => Promise.resolve(<>{data}-two</>))}</span>
            </div>
        }
    }
    it("resolves one shared promise into multiple render locations", async () => {
        const html = await renderToString(<SharedValueComponent />)
        assertEquals(html, '<div><span id="one">shared-one</span><span id="two">shared-two</span></div>')
    })

    class FailingSharedValueComponent extends DynamicServerComponent<EmptyAttrs> {
        override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], request: Request, context: any): ServerVNode {
            const shared = new AsyncRenderObject<string>(
                (async () => { await sleep(10); throw new Error("shared failure") })(),
                request,
                context,
                () => <span id="one">fallback</span>,
            )
            return shared.render((data) => Promise.resolve(<span id="one">{data}</span>))
        }
    }
    it("falls back to the provided onFail when the underlying promise rejects", async () => {
        const html = await renderToString(<FailingSharedValueComponent />)
        assertEquals(html, '<span id="one">fallback</span>')
    })
})

describe("prepare-once, render-many", () => {
    class SlowComponent extends DynamicServerComponent<EmptyAttrs> {
        override async render(): Promise<ServerVNode> {
            await sleep(10)
            return <span id="slow">slow value</span>
        }
    }
    const expected = '<!DOCTYPE html><div><span id="fast">fast value</span><span id="slow">slow value</span></div>'

    it("renders the same prepared tree correctly across multiple independent requests", async () => {
        const prepared = prepareHTMLVNodeForRendering(<div><span id="fast">fast value</span><SlowComponent /></div>)
        const first = decoder.decode(await renderServerVNode(prepared, new Request("http://localhost/a"), {}).toArrayBuffer())
        const second = decoder.decode(await renderServerVNode(prepared, new Request("http://localhost/b"), {}).toArrayBuffer())
        assertEquals(first, expected)
        assertEquals(second, expected)
    })

    it("produces identical bytes whether rendered as a stream or all at once", async () => {
        const request = new Request("http://localhost/")
        const buffered = decoder.decode(
            await renderServerVNode(prepareHTMLVNodeForRendering(<div><span id="fast">fast value</span><SlowComponent /></div>), request, {}).toArrayBuffer(),
        )

        const stream = renderServerVNode(prepareHTMLVNodeForRendering(<div><span id="fast">fast value</span><SlowComponent /></div>), request, {}).toReadableStream()
        const reader = stream.getReader()
        const chunks: Uint8Array[] = []
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
        }
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const streamed = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
            streamed.set(chunk, offset)
            offset += chunk.length
        }

        assertEquals(buffered, expected)
        assertEquals(decoder.decode(streamed), expected)
    })
})

describe("prepareVNodeForRendering", () => {
    it("compacts a fully static tree into Uint8Array chunks ahead of render time", () => {
        const prepared = prepareVNodeForRendering(<div id="a"><span>x</span></div>)
        for (const chunk of prepared) {
            assertEquals(chunk instanceof Uint8Array, true)
        }
        const html = prepared.map(chunk => decoder.decode(chunk as Uint8Array)).join("")
        assertEquals(html, '<div id="a"><span>x</span></div>')
    })
    it("leaves a DynamicVNodeElement unresolved rather than rendering it early", () => {
        class UnresolvedComponent extends DynamicServerComponent<EmptyAttrs> {
            override render(): ServerVNode {
                return <span id="dyn">dyn</span>
            }
        }
        const prepared = prepareVNodeForRendering(<div><UnresolvedComponent /></div>)
        // Two chunks: the opening "<div>" and the closing "</div>" straddle the unresolved component
        assertEquals(prepared.length, 3)
        assertEquals(decoder.decode(prepared[0] as Uint8Array), "<div>")
        assertEquals(prepared[1] instanceof Uint8Array, false)
        assertEquals(decoder.decode(prepared[2] as Uint8Array), "</div>")
    })
})
