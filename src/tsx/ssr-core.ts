// deno-lint-ignore-file no-explicit-any

import type { StyleAttrType } from "../jsx-types/dom-types.d.ts"

/** Type used to represent pass-through id to an underlying Element of a Component */
export type IdAttr = {
    /** An id to pass-through to the underlying Element of this Component */
    id?: string
}

/** Type used to represent that children are accepted by a Component */
export type ChildrenAttr = {
    /** A ServerVNode to place as children of this Component */
    children?: ServerVNode
}

/** Type used to represent pass-through style controls by a Component to an underlying Element */
export type StylePassthroughAttrs = {
    /** A string of CSS class names to pass-through to the underlying Element of this Component */
    class?: string
    /** CSS styles to pass-through to the underlying Element of this Component */
    style?: StyleAttrType
}

/** Basic primitives that are renderable directly */
export type BasicTypes = string | bigint | number | boolean

/** Type used to represent that no Attrs are accepted for a Component */
export type EmptyAttrs = Record<string | number | symbol, never>

/** Text encoder for convertine strings to Uint8 */
const encoder = new TextEncoder()

/** Set of special characters that need escaping in HTML text */
const encodedHtmlEntities = /["&<]/

/** Regex of special characters that need escaping in HTML text */
const encodedHtmlRegex = /["&<]/g

/** Replace special HTML characters with HTML entities */
function escapeHtmlText(str: string): string {
	if (str.length === 0 || encodedHtmlEntities.test(str) === false) {
        return str
    }
    return str.replace(encodedHtmlRegex, function(match: string): string {
		if (match === '"') {
			return '&quot;'
        } else if (match === '&') {
			return '&amp;'
        }
		return '&lt;'
    })
}

/** Set of special characters that need escaping in HTML text (specific to `<style>` and `<script>` tags) */
const encodedStyleScriptEntities = /[>&<]/

/** Regex of special characters that need escaping in HTML text (specific to `<style>` and `<script>` tags) */
const encodedStyleScriptRegex = /[>&<]/g

/** Replace special HTML characters with HTML entities */
function escapeStyleScriptText(str: string): string {
	if (str.length === 0 || encodedStyleScriptEntities.test(str) === false) {
        return str
    }
    return str.replace(encodedStyleScriptRegex, function(match: string): string {
		if (match === '>') {
			return '&gt;'
        } else if (match === '&') {
			return '&amp;'
        }
		return '&lt;'
    })
}

/** Replace special characters needed in quoted HTML Attribute values with HTML entities */
function escapeHtmlAttrValueText(str: string): string {
	if (str.length === 0 || str.includes('"') === false) {
        return str
    }
    return str.replaceAll('"', '&quot;')
}

/** Set of special characters that need escaping in HTML Attribute name */
const invalidHtmlAttrNameChars = /[^-_:\.a-zA-Z0-9]/
/** Set of special characters that need escaping in HTML Attribute name */
const invalidHtmlAttrNameCharsGlobal = /[^-_:\.a-zA-Z0-9]/g

/** Remove invalid characters from HTML Attribute names */
function cleanHtmlAttrNameText(str: string): string {
	if (str.length === 0 || invalidHtmlAttrNameChars.test(str) === false) {
        return str
    }
    return str.replace(invalidHtmlAttrNameCharsGlobal, '')
}

function attributeKeyConstructor([key, value]: [string, string]) {
    if (value == "") {
        return ` ${cleanHtmlAttrNameText(key)}`
    }
    return ` ${cleanHtmlAttrNameText(key)}="${escapeHtmlAttrValueText(value)}"`
}

/**
 * A RenderedVNodeElement that will resolve async
 */
export class AsyncRenderedVNodeElement {
    /** The underlying Promise that this node depends on */
    promise: Promise<RenderedVDOM>
    /** If the Promise has resolved then the resulting RenderedVNode is captured here */
    result?: RenderedVNode = undefined
    /** Create a new AsyncRenderedVNodeElement */
    constructor(promise: Promise<RenderedVDOM>) {
        this.promise = promise
        promise.then(result => {
            this.result = result.node
        })
    }
}

/**
 * Either Bytes that are ready to append into a Response or an AsyncNode to await
 * to then get Bytes instead
 */
export type RenderedVNodeElement = Uint8Array | AsyncRenderedVNodeElement

/** Rendered VNodes that are ready for processing into a Response */
export type RenderedVNode = RenderedVNodeElement | RenderedVNode[]

/** A ServerVNode that has been compacted and prepared for rendering */
export type PreparedServerVNodeElement = DynamicVNodeElement | Uint8Array

/** A ServerVNode that has been compacted and prepared for rendering */
export type PreparedServerVNode = PreparedServerVNodeElement[]

/** An individual element as part of a ServerVNode */
export type ServerVNodeElement = HTMLElement | SafeText | DynamicVNodeElement | BasicTypes | null

/** Virtual Node for use in SSR */
export type ServerVNode = ServerVNodeElement | ServerVNode[]

/**
 * Prepare a ServerVNode for rendering, the output will be compacted and a flat array.
 * 
 * This will call `prepareVNodeForRendering()` with a prepended `<!DOCTYPE html>` to
 * create a valid html document.
 */
export function prepareHTMLVNodeForRendering(node: ServerVNode): PreparedServerVNode {
    return prepareVNodeForRendering(["<!DOCTYPE html>", node])
}

/**
 * Prepare a ServerVNode for rendering, the output will be compacted and a flat array.
 */
export function prepareVNodeForRendering(node: ServerVNode): PreparedServerVNode {
    const flatNodes: (ServerVNodeElement | PreparedServerVNodeElement)[] = []
    flattenArray(flatNodes, node)
    const output: PreparedServerVNode = []
    let nextString: string = ""
    let index = 0
    let cont = true
    while(cont) {
        const node = flatNodes[index]
        if (typeof node === 'string') {
            nextString += node
        } else if (typeof node === 'bigint') {
            nextString += node
        } else if (typeof node === 'number') {
            nextString += node
        } else if (typeof node === 'boolean') {
            nextString += node
        } else if (node instanceof SafeText) {
            nextString += node.text
        } else if (node instanceof DynamicVNodeElement || node instanceof Uint8Array) {
            if (nextString != "") {
                output.push(encoder.encode(nextString))
                nextString = ""
            }
            output.push(node)
        } else if (node instanceof HTMLElement) {
            if (nextString != "") {
                output.push(encoder.encode((nextString)))
                nextString = ""
            }
            flatNodes.splice(index, 1, ...node.prepareElement())
            index--
        }
        index++
        if (index >= flatNodes.length) {
            cont = false
        }
    }
    if (nextString != "") {
        output.push(encoder.encode(nextString))
    }
    return output
}

/**
 * Transforms VNodes (either prepared or raw) into RenderedVDOM
 */
export function renderServerVNode(node: ServerVNode | PreparedServerVNode, request: Request, context: any): RenderedVDOM {
    const flatNodes: (ServerVNodeElement | PreparedServerVNodeElement)[] = []
    flattenArray(flatNodes, node)
    const output: RenderedVNode[] = []
    let index = 0
    let cont = true
    while(cont) {
        const node = flatNodes[index]
        if (typeof node === 'string') {
            output.push(encoder.encode(node))
        } else if (node instanceof DynamicVNodeElement) {
            output.push(new AsyncRenderedVNodeElement(node.render(request, context)))
        } else if (node instanceof HTMLElement) {
            flatNodes.splice(index, 1, ...node.prepareElement())
            index--
        } else if (node instanceof SafeText) {
            output.push(encoder.encode(node.text))
        } else if (node instanceof AsyncRenderedVNodeElement || node instanceof Uint8Array) {
            output.push(node)
        } else if (node !== null) {
            output.push(encoder.encode(String(node)))
        }
        index++
        if (index >= flatNodes.length) {
            cont = false
        }
    }
    return new RenderedVDOM(output)
}

function escapeStringNode(node: ServerVNode): ServerVNode {
    if (typeof node === "string") {
        return escapeHtmlText(node)
    }
    return node
}

/**
 * A Dynamic VNode that requires a Request and Context in order to render
 */
export class DynamicVNodeElement {
    /** A link to the referenced Component */
    component: DynamicServerComponent<any>
    /** The attrs for this VNode */
    attrs: Readonly<any>
    /** The children for this VNode */
    children: Readonly<any[]>
    /** Create a new DynamicVNodeElement */
    constructor(component: DynamicServerComponent<any>, attrs: Readonly<any>, children: Readonly<any[]>) {
        this.component = component
        this.attrs = attrs
        this.children = children
    }
    /** Render this VNodeElement with the given Request and Context */
    async render(request: Request, context: any): Promise<RenderedVDOM> {
        try {
            const ret = this.component.render(this.attrs, this.children, request, context)
            if (ret instanceof Promise) {
                return renderServerVNode(escapeStringNode(await ret), request, context)
            } else {
                return renderServerVNode(escapeStringNode(ret), request, context)
            }
        } catch (reason: any) {
            return renderServerVNode(escapeStringNode(this.component.onFail(reason, this.attrs, this.children, request, context)), request, context)
        }
    }
}

/**
 * Take a recursive array type and flatten it down into a single flat array
 * 
 * For example:
 * 
 * ```
 * const x = [ [1, 2] , [[3]] , 4]
 * const y = []
 * flattenArray(y, x)
 * ```
 * then `y` will equal `[1,2,3,4]`
 */
function flattenArray<T>(output: T[], node: any) {
    if (node instanceof Array) {
        for (const element of node) {
            if (element instanceof Array) {
                flattenArray(output, element)
            } else {
                output.push(element)
            }
        }
    } else {
        output.push(node)
    }
}

/**
 * Stitch up an array of Uint8Array into a single Uint8Array
 */
function concatenateUint8Arrays(uint8arrays: Uint8Array[]) {
    const totalLength = uint8arrays.reduce(function(sum, arr) {return sum + arr.length}, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const arr of uint8arrays) {
        result.set(arr, offset)
        offset += arr.length
    }
    return result
}

/**
 * Stitch up an array of Uint8Array into a single ArrayBuffer
 */
function concatenateUint8ArraysToArrayBuffer(uint8arrays: Uint8Array[]) {
    const totalLength = uint8arrays.reduce(function(sum, arr) {return sum + arr.length}, 0)
    const arrayBuffer = new ArrayBuffer(totalLength)
    const result = new Uint8Array(arrayBuffer)
    let offset = 0
    for (const arr of uint8arrays) {
        result.set(arr, offset)
        offset += arr.length
    }
    return arrayBuffer
}

/**
 * A rendered RenderedVNode with a set of methods to convert into other formats
 */
export class RenderedVDOM {
    /** The RenderedVNode this VDOM wraps */
    node: RenderedVNode
    /** Create a new RenderedVDOM */
    constructor(nodes: RenderedVNode) {
        this.node = nodes
    }

    /**
     * Convert into a Uint8Array[]
     * 
     * Used for creating a `Response()` that returns all at once
     */
    async #toUint8ArrayArray(): Promise<Uint8Array[]> {
        const flatNodes: RenderedVNodeElement[] = []
        flattenArray(flatNodes, this.node)
        const bytes: Uint8Array[] = []
        let index = 0
        let cont = true
        while(cont) {
            const node = flatNodes[index]
            if (node instanceof AsyncRenderedVNodeElement) {
                try {
                    const res = (await node.promise).node
                    if (res instanceof Array) {
                        const flatRes: RenderedVNodeElement[] = []
                        flattenArray(flatRes, res)
                        flatNodes.splice(index, 1, ...flatRes)
                    } else {
                        flatNodes[index] = res
                    }
                } catch (error: any) {
                    console.error("Error during rendering, skipping node", node, error)
                }
                index--
            } else {
                bytes.push(node)
            }
            index++
            if (index >= flatNodes.length) {
                cont = false
            }
        }
        return bytes
    }

    /**
     * Convert into a single Uint8Array
     */
    async toUint8Array(): Promise<Uint8Array> {
        return concatenateUint8Arrays(await this.#toUint8ArrayArray())
    }
    /**
     * Convert into an ArrayBuffer
     * 
     * Used for creating a `Response()` that returns all at once
     */
    async toArrayBuffer(): Promise<ArrayBuffer> {
        return concatenateUint8ArraysToArrayBuffer(await this.#toUint8ArrayArray())
    }
    /**
     * Convert into a ReadableStream
     * 
     * Used for creating a `Response()` that streams the response back to the client
     */
    toReadableStream(): ReadableStream {
        const flatNodes: RenderedVNodeElement[] = []
        flattenArray(flatNodes, this.node)
        let index = 0
        return new ReadableStream({
            cancel: (reason) => {
                console.error("ReadableStream failure", reason)
            },
            pull: (controller) => {
                let cont = true
                while(cont) {
                    const node = flatNodes[index]
                    if (node instanceof AsyncRenderedVNodeElement) {
                        if (node.result) {
                            if (node.result instanceof Array) {
                                const flatRes: RenderedVNodeElement[] = []
                                flattenArray(flatRes, node.result)
                                flatNodes.splice(index, 1, ...flatRes)
                            } else {
                                flatNodes[index] = node.result
                            }
                            continue
                        } else {
                            return new Promise(resolve => {
                                node.promise.finally(()=>{
                                    resolve()
                                })
                            })
                        }
                    } else {
                        controller.enqueue(node)
                        index++
                        if (index >= flatNodes.length) {
                            cont = false
                        }
                    }
                }
                controller.close()
            }
        }, {
            highWaterMark: 10
        })
    }
}

/**
 * A VelotypeSSR Component that can be used in .tsx files to render HTML Components.
 */
export type StaticServerComponent<AttrsType> = (attrs: Readonly<AttrsType>, children: ServerVNode[]) => ServerVNode | null | undefined

/**
 * A Dynamic Component that needs the specific `request` and `context` in order
 * to render a `Response` to the client
 */
export abstract class DynamicServerComponent<AttrsType> {
    /** The attrs for this Component */
    attrs: Readonly<AttrsType>
    /** The children for this Component */
    children: Readonly<ServerVNode[]>
    /**
     * Create a new DynamicServerComponent
     * 
     * Should not need to be called directly
     */
    constructor(attrs: Readonly<AttrsType>, children: Readonly<ServerVNode[]>) {
        this.attrs = attrs
        this.children = children
    }
    /**
     * Render this Component given a set of attrs, children, as well as a request and context
     * 
     * May return sync or async
     */
    abstract render(attrs: Readonly<AttrsType>, children: Readonly<ServerVNode[]>, request: Request, context: any): ServerVNode | Promise<ServerVNode>
    /**
     * In the case that `render()` returns async and fails, then this `onFail()` function
     * is called with the `reason` from the failed Promise
     * 
     * The default behavior will resolve in the Component not rendering anything, though can be
     * overridden to display a relevant error message to the user.
     */
    onFail(reason: Readonly<any>, _attrs: Readonly<AttrsType>, _children: Readonly<ServerVNode[]>, _request: Request, _context: any): ServerVNode {
        console.error("DynamicServerComponent rendering failed", reason)
        return null
    }
}
/**
 * A RenderObject that resolves asynchronously and can be rendered into
 * multiple locations in the VDOM
 */
export class AsyncRenderObject<DataType> {
    /** The Promise this Async object is waiting on */
    promise: Promise<DataType>
    /** The Request used in this render pass */
    request: Request
    /** The Context used in this render pass */
    context: any
    /** A default onFail function used for all cases where `render()` is called on this RenderObject */
    defaultOnFail: (reason: Readonly<any>, request: Request, context: any) => ServerVNode
    /** Create a new AsyncRenderObject */
    constructor(promise: Promise<DataType>, request: Request, context: any, defaultOnFail?: (reason: Readonly<any>, request: Request, context: any) => ServerVNode) {
        this.promise = promise
        this.request = request
        this.context = context
        if (defaultOnFail) {
            this.defaultOnFail = defaultOnFail
        } else {
            this.defaultOnFail = function(reason: Readonly<any>, _request: Request, _context: any): ServerVNode {
                console.error("AsyncRenderObject rendering failed", reason)
                return null
            }
        }
    }
    /**
     * Render this AsyncRenderObject into a VNode with the fiven `renderFunction()`
     * when the AsyncRenderObject's Promise resolves
     */
    render(renderFunction: (data: DataType) => Promise<ServerVNode>, onFail?: (reason: Readonly<any>, request: Request, context: any) => ServerVNode): AsyncRenderedVNodeElement {
        return new AsyncRenderedVNodeElement(new Promise(resolve => {
            this.promise.then(async data => {
                try {
                    resolve(renderServerVNode(escapeStringNode(await renderFunction(data)), this.request, this.context))
                } catch (reason: any) {
                    if (onFail) {
                        resolve(renderServerVNode(escapeStringNode(onFail(reason, this.request, this.context)), this.request, this.context))
                    } else {
                        resolve(renderServerVNode(escapeStringNode(this.defaultOnFail(reason, this.request, this.context)), this.request, this.context))
                    }
                }
            })
        }))
    }
}

/**
 * Convert from lowerCamelCase to hypen-case
 */
const upperToHypenCase = function(text: string) {
    return text.replace(/[A-Z]/g, function(char) {return "-"+char.toLowerCase()})
}

/**
 * The Set of Void Elements in HTML (aka the set of elements that do not
 * have a closing `</tag>`)
 * 
 * For example `<span><input></span>` is correct HTML and `<span><input></input></span>` is incorrect
 * 
 * Browsers will ignore a closing tag if present on Void Elements
 * 
 * Reference: https://developer.mozilla.org/en-US/docs/Glossary/Void_element
 */
const voidTags = new Set<string>()
voidTags.add("area")
voidTags.add("base")
voidTags.add("br")
voidTags.add("col")
voidTags.add("embed")
voidTags.add("hr")
voidTags.add("img")
voidTags.add("input")
voidTags.add("link")
voidTags.add("meta")
// param is deprecated
voidTags.add("source")
voidTags.add("track")
voidTags.add("wbr")

/**
 * A Server-side representation of an HTMLElement
 */
export class HTMLElement {
    /** The tag for this HTMLElement */
    tag: string
    /** The attrs for this HTMLElement */
    attrs: Readonly<any>
    /** The children for this HTMLElement */
    children: Readonly<ServerVNode[]>
    /** Create a new HTMLElement */
    constructor(tag: string, attrs: Readonly<any>, children: Readonly<ServerVNode[]>) {
        this.tag = tag
        this.attrs = attrs
        this.children = children
    }
    /**
     * Prepare this HTMLElement for rendering
     */
    prepareElement(): PreparedServerVNode {
        const attributes: Map<string,string> = new Map<string,string>()
        for (const [name, value] of Object.entries(this.attrs || {})) {
            if (name.startsWith('on')) {
                //do nothing, can't use event listeners server-side
                console.error("WARN, attempt to attach event listener when SSR rendering", this.tag, this.attrs)
                // TODO: Revisit the idea of allowing inline javascript function attributes
                /// deno-lint-ignore ban-types
                //element.setAttribute(name,`(${(value as Function).toString().replaceAll('"','&quot;')})(...arguments);`)
            } else {
                // Special handling for style object
                if (name == "style" && value instanceof Object) {
                    // Special handling for style object
                    const styleAttributes = []
                    for (const key of Object.keys(value)) {
                        styleAttributes.push(upperToHypenCase(key)+":"+value[key as keyof typeof value])
                    }
                    const styleValue = styleAttributes.join(";")
                    attributes.set(name, styleValue)
                } else if (typeof value == "boolean") {
                    // Boolean true gets set to empty string, boolean false does not get set
                    if (value) {
                        attributes.set(name,"")
                    }
                } else if (value) {
                    attributes.set(name, value.toString())
                }
            }
        }
        if (voidTags.has(this.tag)) {
            return [encoder.encode(`<${this.tag}${Array.from(attributes.entries()).map(attributeKeyConstructor).join("")}>`)]
        } else if (this.tag == "style" || this.tag == "script") {
            const escapedChildren: PreparedServerVNode = []
            escapeChildren(escapedChildren, this.children, false)
            const output: PreparedServerVNode = [encoder.encode(`<${this.tag}${Array.from(attributes.entries()).map(attributeKeyConstructor).join("")}>`)]
            for (const child of escapedChildren) {
                output.push(child)
            }
            output.push(encoder.encode(`</${this.tag}>`))
            return output
        } else {
            const escapedChildren: PreparedServerVNode = []
            escapeChildren(escapedChildren, this.children)
            const output: PreparedServerVNode = [encoder.encode(`<${this.tag}${Array.from(attributes.entries()).map(attributeKeyConstructor).join("")}>`)]
            for (const child of escapedChildren) {
                output.push(child)
            }
            output.push(encoder.encode(`</${this.tag}>`))
            return output
        }
    }
}

/**
 * Represent a raw string literal that is not escaped. The default escaping
 * will handle the vast majority of cases properly, however HTML / CSS / SVG / JS
 * escaping is complex and syntax parsing dependent. This class can be used
 * to manage complex scenarios, however should be used carefully.
 * 
 * Use with caution, only when input text is known to be safe
 */
export class SafeText {
    text: string
    constructor(text: string) {
        this.text = text
    }
}

/**
 * Process a set of VNodes and string escape any `string` node to be safe HTML Text
 */
function escapeChildren(escapedChildren: PreparedServerVNode, children: Readonly<ServerVNode[]>, useHtmlEscape: boolean = true) {
    for (const child of children) {
        if (child instanceof Array) {
            escapeChildren(escapedChildren, child)
        } else if (child instanceof SafeText) {
            escapedChildren.push(encoder.encode(child.text))
        } else if (child instanceof HTMLElement) {
            escapedChildren.push(...child.prepareElement())
        } else if (typeof child === "string") {
            escapedChildren.push(encoder.encode(useHtmlEscape?escapeHtmlText(child):escapeStyleScriptText(child)))
        } else if (child instanceof DynamicVNodeElement) {
            escapedChildren.push(child)
        } else if (child !== null && child !== undefined) {
            escapedChildren.push(encoder.encode(String(child)))
        }
    }
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 */
export function createElement(tag: any, attrs: Readonly<any>, ...children: Readonly<ServerVNode[]>): ServerVNode {
    const notNullAttrs = attrs || {}
    if (tag?.prototype instanceof SafeText) {
        return new SafeText(attrs.text)
    } else if (tag?.prototype instanceof DynamicServerComponent) {
        // Create DynamicVNodeElement for resolution later
        return new DynamicVNodeElement(new tag(notNullAttrs, children), notNullAttrs, children)
    } else if (typeof tag === 'function') {
        // Render Function component now
        return escapeStringNode(tag(notNullAttrs, children))
    } else if (typeof tag === 'string') {
        // Inline HTML Element
        return new HTMLElement(tag, attrs, children)
    }
    console.error('Invalid tag', tag, notNullAttrs, children)
    return null
}

/**
 * Create an fragment \<></> (which just propagates an array of children[])
 */
export function createFragment(_attrs: any, ...children: ServerVNode[]): ServerVNode {
    return children
}
