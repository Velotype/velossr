// deno-lint-ignore-file jsx-no-useless-fragment jsx-curly-braces
import { Context } from "@velotype/veloserver"
import {DynamicServerComponent, ChildrenAttr, StaticServerComponent} from "jsr:@velotype/velossr"
import type {EmptyAttrs, ServerVNode} from "jsr:@velotype/velossr"

type BasicNavAttrsType = {
    modules: [{name: string}]
}
class BasicNav extends StaticServerComponent<BasicNavAttrsType> {
    override render(attrs: BasicNavAttrsType) {
        return <div>
            <div><a href="/">Home</a></div>
            {attrs.modules.map(module=> <>
                <div><a href={`/sync/${module.name}`}>sync {module.name}</a></div>
                <div><a href={`/stream/${module.name}`}>stream {module.name}</a></div>
            </>)}
        </div>
    }
}
export type BasicPageAttrsType = {
    modules: [{name: string}]
}
export class BasicPage extends StaticServerComponent<BasicNavAttrsType & ChildrenAttr> {
    override render(attrs: BasicNavAttrsType, children: ServerVNode) {
        return <html>
            <body>
                <BasicNav modules={attrs.modules} />
                {children}
            </body>
        </html>
    }
}

export class BasicStaticTest extends StaticServerComponent<EmptyAttrs> {
    override render() {
        return <div>
                <style>{`
#hello-div {
color: red;
}
`}</style>
            <div id="hello-div">Hello Velotype!</div>
            <hr/>
            <>
                this is some & text {'"<&'}
            </>
            <div id="style-object" style={{display:"flex", marginTop:"4px"}}>style object</div>
        </div>
    }
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

export class BasicDynamicTest extends StaticServerComponent<EmptyAttrs> {
    override render(_attrs: Readonly<EmptyAttrs>, _children: ServerVNode[]): ServerVNode {
        return <div>
            <div id="hello-div">Hello Velotype!</div>
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
