// deno-lint-ignore-file no-explicit-any

import {

    // Engine types
    type BasicTypes,
    type AsyncRenderedVNodeElement,
    HTMLElement,

    type RenderedVNodeElement,
    type RenderedVNode,
    type ServerVNodeElement,
    type ServerVNode,
    type PreparedServerVNodeElement,
    type PreparedServerVNode,

    // Core types
    type EmptyAttrs,
    type IdAttr,
    type ChildrenAttr,
    type StylePassthroughAttrs,

    // Server side Component types
    type StaticServerComponent,
    DynamicServerComponent,

    // Specialized
    type AsyncRenderObject,
    DynamicVNodeElement,

    // TSX integration
    createElement,
    createFragment,

    // SSR
    prepareVNodeForRendering,
    prepareHTMLVNodeForRendering,
    renderServerVNode,
    RenderedVDOM,

} from "../tsx/ssr-core.ts"

export {

    // Engine types
    type BasicTypes,
    type AsyncRenderedVNodeElement,
    HTMLElement,

    type RenderedVNodeElement,
    type RenderedVNode,
    type ServerVNodeElement,
    type ServerVNode,
    type PreparedServerVNodeElement,
    type PreparedServerVNode,

    // Core types
    type EmptyAttrs,
    type IdAttr,
    type ChildrenAttr,
    type StylePassthroughAttrs,

    // Server side Component types
    type StaticServerComponent,
    DynamicServerComponent,

    // Specialized
    type AsyncRenderObject,
    DynamicVNodeElement,

    // TSX integration
    createElement,
    createFragment,

    // SSR
    prepareVNodeForRendering,
    prepareHTMLVNodeForRendering,
    renderServerVNode,
    RenderedVDOM,
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 */
export function jsx(tag: any, attrs: any, key?: string | undefined): ServerVNode {
    // Pull children out of attrs
    const children = attrs.children
    delete attrs.children

    // Reattach key into attrs if defined
    if (key !== undefined) {
        attrs.key = key
    }
    return createElement(tag, attrs, children)
}

/**
 * Create an element with a tag, set it's attributes using attrs, then append children
 * 
 * ```tsx
 * <tag attrOne={} attrTwo={}>{children}</tag>
 * ```
 * 
 * Note: Velotype does not distinguish between static and dynamic children arrays so jsx and jsxs are identical
 */
export const jsxs: (tag: any, attrs: Readonly<any>, key?: string | undefined) => ServerVNode = jsx

/**
 * Create an fragment `<></>` (which just propagates an array of children[])
 */
export const Fragment: (_attrs: Readonly<any>, ...children: ServerVNode[]) => ServerVNode = createFragment

// Export the JSX namespace for JSX type checking
import type { JSXInternal } from "../jsx-types/jsx-types.d.ts"
export type { JSXInternal as JSX }

// Export all other dom-types
export type * from "../jsx-types/dom-types.d.ts"
