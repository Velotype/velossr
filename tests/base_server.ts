import { App, Context, Inspector, RequestInspectorResponse, Router } from "jsr:@velotype/veloserver"
import { BasicStaticTest, BasicDynamicTest, BasicPage } from "./test_modules/basic-div.tsx"
import { createElement, prepareHTMLVNodeForRendering, renderedVNodeToUint8Array, renderServerVNode } from "jsr:@velotype/velossr/jsx-runtime"

export function startAppServer(server_port: number): Promise<App> {
    const router: Router = new Router()
    router.addAllInspector("", new Inspector(
        (request: Request, context: Context) => {
            console.log(`START ${request.method} ${request.url}`)
            const startTime = performance.now()
            context.metadata.set("st", startTime)
            return new RequestInspectorResponse(true)
        },
        (request: Request, response: Response, context: Context) => {
            const startTime = context.metadata.get("st")
            if (startTime != undefined) {
                const ms = (performance.now() - startTime).toFixed(2)
                response.headers.set("X-Response-Time", `${ms}ms`);
                console.log(`END ${response.status} ${request.method} ${request.url} ${ms}ms`)
            } else {
                console.error(`END ${response.status} ${request.method} ${request.url} ERROR could not calculate elapsed time`)
            }
        }
    ))
    // TODO calculate dynamically from the test_modules folder
    const setOfModules = [{
        name: "basic-static",
        page: BasicStaticTest
    }, {
        name: "basic-dynamic",
        page: BasicDynamicTest
    }]
    setOfModules.forEach((module) => {
        const preparedModule = prepareHTMLVNodeForRendering(createElement(BasicPage,{modules: setOfModules},createElement(module.page,{})))
        router.get(`/${module.name}`, async (request: Request, context: Context) => {
            const response = new Response(await renderedVNodeToUint8Array(renderServerVNode(preparedModule, request, context)),{status:200})
            response.headers.set("content-type", "text/html; charset=utf-8")
            return response
        })
    })
    router.get('/', function() {
        const response = new Response(`<!DOCTYPE html><html><body>
${setOfModules.map(module => `<div><a href="/${module.name}">${module.name}</a></div>`).join('')}
</body></html>`,{status:200})
        response.headers.set("content-type", "text/html; charset=utf-8")
        return response
    })
    const app = new App(router)
    const prom = new Promise<App>((resolve) => {
        app.addServerListenCallback(() => {
            resolve(app)
        })
    })
    app.serve('localhost', server_port)
    return prom
}
