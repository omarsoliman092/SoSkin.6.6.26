import fs from "fs";
import path from "path";

const distClient = path.join(process.cwd(), "dist", "client");
const indexPath = path.join(distClient, "index.html");

if (!fs.existsSync(distClient)) {
  fs.mkdirSync(distClient, { recursive: true });
}

// Generate a basic index.html that points to the assets
// TanStack Start build usually puts the main JS in dist/client/assets/
const assetsDir = path.join(distClient, "assets");
let mainJs = "";
let mainCss = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  mainJs = files.find(f => f.startsWith("index-") && f.endsWith(".js")) || "";
  mainCss = files.find(f => f.startsWith("styles-") && f.endsWith(".css")) || "";
}

const template = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>SoSkin Advisor</title>
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}">` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${mainJs}"></script>
  </body>
</html>`;

fs.writeFileSync(indexPath, template);
console.log("Successfully generated index.html in dist/client");
