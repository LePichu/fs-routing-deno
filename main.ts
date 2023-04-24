import { Hono } from "hono"
import { serve } from "https://deno.land/std@0.184.0/http/server.ts"
import { renderToString } from "preact-render-to-string"

const app = new Hono()

const map = new Map()

const files = Deno.readDirSync("./routes")
for (const file of files) {
	if (file.isFile && file.name.endsWith(".tsx")) {
		if (file.name === "index.tsx") {
			map.set("/", `./routes/${file.name}`)
		} else {
			map.set(`/${file.name.replace(".tsx", "")}`, `./routes/${file.name}`)
		}
	}
}

app.get("*", async (ctx) => {
	if(map.has(ctx.req.path)) {
        const module = await import(map.get(ctx.req.path))
        if(module.default) return ctx.html(`
            <body>
                ${renderToString(module.default())}
            </body>
        `)   
    }

    return ctx.html("<h1>Meow.</h1>")
})

serve(app.fetch, {
	port: 8000,
	onListen: () => console.log("Listening on http://localhost:8000/"),
})
