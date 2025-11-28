/// <reference lib="deno.ns" />

import { afterAll, beforeAll, describe, it } from "@std/testing/bdd"
import { fail, assertEquals, assertLess } from "@std/assert"

import {App} from "@velotype/veloserver"

import { launch } from "@astral/astral"
import type { Browser, ElementHandle, Page } from "@astral/astral"
import { startAppServer } from "./base_server.ts"

const server_port = 3000
const baseUrl = `http://localhost:${server_port}`

describe('basic component rendering', () => {
    let server: App
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        server = await startAppServer(server_port)
        browser = await launch({
            headless: true,
            args: ['--no-sandbox']
        })
        page = await browser.newPage()
        await page.setViewportSize({ width: 400, height: 200 })
    })
    afterAll(async () => {
        await page?.close()
        await browser?.close()
        await server?.close('End basic tests')
    })

    const itWrap = (name: string, module: string, selector: string, testFn: (selection: ElementHandle) => void | Promise<void>) => {
        it({name,
            fn: async () => {
                try {
                    await page.goto(`${baseUrl}/sync/${module}`, {waitUntil: 'networkidle2'})
                    const selection = await page.waitForSelector(selector)
                    if (selection) {
                        await testFn(selection)
                    } else {
                        fail(`ERROR: Selector not found: ${selector}`)
                    }
                } catch (e) {
                    console.log("Exception",e)
                    fail("ERROR: Thrown exception")
                }
            }
        })
        it({name,
            fn: async () => {
                try {
                    await page.goto(`${baseUrl}/stream/${module}`, {waitUntil: 'networkidle2'})
                    const selection = await page.waitForSelector(selector)
                    if (selection) {
                        await testFn(selection)
                    } else {
                        fail(`ERROR: Selector not found: ${selector}`)
                    }
                } catch (e) {
                    console.log("Exception",e)
                    fail("ERROR: Thrown exception")
                }
            }
        })
    }
    type TestVariation = {
        selector: string
        text?: string
        html?: string
        includesHtml?: string
        attributes?: {
            name: string
            value: string
        }[]
    }
    const testVariations = async (setOfVariations: TestVariation[]) => {
        for (const variant of setOfVariations) {
            console.log("testing variant:", variant)
            const selection = await page.waitForSelector(variant.selector)
            if (selection) {
                if (variant.text != undefined) {
                    assertEquals(await selection.innerText(),variant.text)
                }
                if (variant.html != undefined) {
                    assertEquals(await selection.innerHTML(),variant.html)
                }
                if (variant.includesHtml != undefined) {
                    const doesInclude = (await selection.innerHTML()).includes(variant.includesHtml)
                    assertEquals(doesInclude, true)
                }
                if (variant.attributes) {
                    for (const attribute of variant.attributes) {
                        assertEquals(await selection.getAttribute(attribute.name),attribute.value)
                    }
                }
            } else {
                fail(`ERROR: Selector not found: #${variant}`)
            }
        }
    }

    itWrap("set of basic-static tests", "basic-static", "#hello-div", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#hello-div", html: "Hello Velotype!"},
            {selector: "#empty-div", html: ""},
            {selector: "#style-tag", includesHtml: 'areas:"navbar" "pagecontent" "footer";'},
            {selector: "#style-tag-safetext", includesHtml: 'mask-image:url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none" width="100" height="50"><g transform="scale(1,-1)" tra'},
            {selector: "#script-tag", includesHtml: 'const someVar = "someVal";'},
            {selector: "#script-tag-safetext", includesHtml: 'const someVar = "<someVal>";'},
            {selector: "#style-object", attributes: [{name: "style", value: "display:flex;margin-top:4px"}]},
        ]
        await testVariations(setOfVariations)
    })

    itWrap("set of basic-dynamic tests", "basic-dynamic", "#hello-div", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#hello-div", html: "Hello Velotype!"},
            {selector: "#empty-div", html: ""},
            {selector: "#style-tag", includesHtml: 'areas:"navbar" "pagecontent" "footer";'},
            {selector: "#style-tag-safetext", includesHtml: 'mask-image:url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none" width="100" height="50"><g transform="scale(1,-1)" tra'},
            {selector: "#script-tag", includesHtml: 'const someVar = "someVal";'},
            {selector: "#script-tag-safetext", includesHtml: 'const someVar = "<someVal>";'},
            {selector: "#hello-dynamic-div", html: "Hello Velotype dynamic streaming!"},
        ]
        await testVariations(setOfVariations)
    })
    itWrap("set of basic-throw-sync tests", "basic-throw-sync", "#after-content", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#before-content", html: "before content"},
            {selector: "#throw-content", html: "throw content"},
            {selector: "#after-content", html: "after content"},
        ]
        await testVariations(setOfVariations)
    })
    itWrap("set of basic-throw-sync tests", "basic-throw-sync", "#after-content", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#before-content", html: "before content"},
            {selector: "#throw-content", html: "throw content"},
            {selector: "#after-content", html: "after content"},
        ]
        await testVariations(setOfVariations)
    })
    itWrap("set of basic-throw-async tests", "basic-throw-async?throw", "#after-content", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#before-content", html: "before content"},
            {selector: "#outer-throw-content", html: ""},
            {selector: "#after-content", html: "after content"},
        ]
        await testVariations(setOfVariations)
    })
    itWrap("set of basic-throw-async tests", "basic-throw-async?throw", "#after-content", async (_pageLoadSelection: ElementHandle) => {
        const setOfVariations = [
            {selector: "#before-content", html: "before content"},
            {selector: "#outer-throw-content", html: ""},
            {selector: "#after-content", html: "after content"},
        ]
        await testVariations(setOfVariations)
    })
    it({name: "sync basic-dynamic renders timely", fn: async () => {
        try {
            const startTime = performance.now()
            await page.goto(`${baseUrl}/sync/basic-dynamic`, {waitUntil: 'networkidle2'})
            await page.waitForSelector("#hello-dynamic-div")
            const time = performance.now() - startTime
            console.log("time",time)
            assertLess(time, 2000)
        } catch (e) {
            console.log("Exception",e)
            fail("ERROR: Thrown exception")
        }
    }})
    it({name: "stream basic-dynamic renders timely", fn: async () => {
        try {
            const startTime = performance.now()
            await page.goto(`${baseUrl}/stream/basic-dynamic`, {waitUntil: 'networkidle2'})
            await page.waitForSelector("#hello-dynamic-div")
            const time = performance.now() - startTime
            console.log("time",time)
            assertLess(time, 2000)
        } catch (e) {
            console.log("Exception",e)
            fail("ERROR: Thrown exception")
        }
    }})

})
