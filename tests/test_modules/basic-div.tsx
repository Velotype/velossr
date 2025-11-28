// deno-lint-ignore-file jsx-no-useless-fragment jsx-curly-braces
import { Context } from "@velotype/veloserver"
import {DynamicServerComponent, ChildrenAttr, StaticServerComponent, SafeText} from "@velotype/velossr"
import type {EmptyAttrs, ServerVNode} from "@velotype/velossr"

type BasicNavAttrsType = {
    modules: [{name: string}]
}
const BasicNav: StaticServerComponent<BasicNavAttrsType> = function(attrs: Readonly<BasicNavAttrsType>): ServerVNode {
    return <div>
        <div><a href="/">Home</a></div>
        {attrs.modules.map(module=> <>
            <div><a href={`/sync/${module.name}`}>sync {module.name}</a></div>
            <div><a href={`/stream/${module.name}`}>stream {module.name}</a></div>
        </>)}
    </div>
}
export type BasicPageAttrsType = {
    modules: [{name: string}]
}
export const BasicPage: StaticServerComponent<BasicPageAttrsType & ChildrenAttr> = function(attrs: Readonly<BasicPageAttrsType>, children: ServerVNode): ServerVNode {
    return <html>
        <body>
            <BasicNav modules={attrs.modules} />
            {children}
        </body>
    </html>
}

export const BasicStaticTest: StaticServerComponent<EmptyAttrs> = function(): ServerVNode {
    return <div>
            <style id="style-tag">{`
#hello-div{color:red;}
#other-div{
display:grid;
grid-template-areas:"navbar" "pagecontent" "footer";
}
`}</style>
        <style id="style-tag-safetext">{new SafeText(`
.mask-box {
mask-image:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none" width="100" height="50"><g transform="scale(1,-1)" transform-origin="50%"><path d="M0 0v100S0 4 500 4s500 96 500 96V0H0Z"></path></g></svg>');
}
`)}</style>
        <script id="script-tag-safetext">{new SafeText(`
function testFunc() {
    const someVar = "<someVal>";
    return 3;
}
`)}</script>
        <script id="script-tag">{`
function testFunc() {
    const someVar = "someVal";
    return 3;
}
`}</script>
        <div id="hello-div">Hello Velotype!</div>
        <div id="empty-div"></div>
        <div class="mask-box">this is a box with a css mask</div>
        <hr/>
        <>
            this is some & text {'"<&'}
        </>
        <div id="style-object" style={{display:"flex", marginTop:"4px"}}>style object</div>
    </div>
}

class RequestUrlAsyncTest extends DynamicServerComponent<EmptyAttrs> {
    override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, _context: Context): ServerVNode {
        return <div>
            <div>{"A combo of static & dynamic: "}<RequestUrlTest/></div>
        </div>
    }
}
function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
class RequestUrlTest extends DynamicServerComponent<EmptyAttrs> {
    override async render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], request: Request, _context: Context): Promise<ServerVNode> {
        await sleep(1000)
        return request.url + 'sleep&<"!'
    }
}

export const BasicDynamicTest: StaticServerComponent<EmptyAttrs> = function(): ServerVNode {
    return <div>
        <div id="hello-div">Hello Velotype!</div>
        <div id="empty-div"></div>
        <style id="style-tag">{`
#hello-div{color:red;}
#other-div{
display:grid;
grid-template-areas:"navbar" "pagecontent" "footer";
}
`}</style>
        <style id="style-tag-safetext">{new SafeText(`
.mask-box {
mask-image:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none" width="100" height="50"><g transform="scale(1,-1)" transform-origin="50%"><path d="M0 0v100S0 4 500 4s500 96 500 96V0H0Z"></path></g></svg>');
}
`)}</style>
        <script id="script-tag-safetext">{new SafeText(`
function testFunc() {
    const someVar = "<someVal>";
    return 3;
}
`)}</script>
        <script id="script-tag">{`
function testFunc() {
    const someVar = "someVal";
    return 3;
}
`}</script>
        <div class="mask-box">this is a box with a css mask</div>
        <hr/>
        <RequestUrlAsyncTest/>
        <hr/>
        <RequestUrlTest/>
        <hr/>
        <RequestUrlTest/>
        <hr/>
        <RequestUrlTest/>
        <hr/>
        <RequestUrlTest/>
        <hr/>
        <RequestUrlTest/>
        <hr/>
        <div id="hello-dynamic-div">Hello Velotype dynamic streaming!</div>
    </div>
}

export class BasicThrowSyncComponent extends DynamicServerComponent<EmptyAttrs> {
    override async render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, context: Context): Promise<ServerVNode> {
        if (context.url.searchParams.has("throw")) {
            throw new Error("errored for some reason")
        }
        await sleep(500)
        return <div id="throw-content">throw content</div>
    }
}

export class BasicThrowASyncComponent extends DynamicServerComponent<EmptyAttrs> {
    override async render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, context: Context): Promise<ServerVNode> {
        if (context.url.searchParams.has("throw")) {
            throw new Error("errored for some reason")
        }
        await sleep(500)
        return <div id="throw-content">throw content</div>
    }
}

export class BasicThrowSyncTest extends DynamicServerComponent<EmptyAttrs> {
    override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, _context: Context): ServerVNode {
        return <div>
            <div id="before-content">before content</div>
            <div id="outer-throw-content"><BasicThrowSyncComponent/></div>
            <div id="after-content">after content</div>
        </div>
    }
}

export class BasicThrowASyncTest extends DynamicServerComponent<EmptyAttrs> {
    override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[], _request: Request, _context: Context): ServerVNode {
        return <div>
            <div id="before-content">before content</div>
            <div id="outer-throw-content"><BasicThrowASyncComponent/></div>
            <div id="after-content">after content</div>
        </div>
    }
}
