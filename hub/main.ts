import { Hono } from "@honojs/hono";
import { serveStatic } from "@honojs/hono/deno";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./static/" }));
app.use("*", serveStatic({ root: "./public/" }));

Deno.serve(app.fetch)