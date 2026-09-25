import { load } from "cheerio";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import * as fs from "fs";
import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import path from "path";

const SITE_ORIGIN = "https://ladyahorro.com";

function filePathToSourceUrl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  let urlPath = normalized.replace(/\.html$/, "");
  if (urlPath.endsWith("/index") || urlPath === "ladyahorro.com/index") {
    urlPath = urlPath.replace(/\/?index$/, "");
  }
  if (!urlPath.includes("/")) {
    return `${SITE_ORIGIN}/`;
  }
  const withoutHostDir = urlPath.replace(/^ladyahorro\.com\/?/, "");
  if (!withoutHostDir) {
    return `${SITE_ORIGIN}/`;
  }
  return `${SITE_ORIGIN}/${withoutHostDir}`;
}

function collectAbsoluteLinks($: ReturnType<typeof load>): string[] {
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const label = $(el).text().replace(/\s+/g, " ").trim();
    if (!href || !label) return;
    if (
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:")
    ) {
      return;
    }
    try {
      const url = href.startsWith("http")
        ? href
        : new URL(href, SITE_ORIGIN).toString();
      links.push(`${label}: ${url}`);
    } catch {
      // skip invalid hrefs
    }
  });
  return [...new Set(links)];
}

async function processFile(filePath: string): Promise<Document> {
  return await new Promise<Document>((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      } else {
        const $ = load(fileContents);
        // Collect links before stripping structure that may contain them
        const linkLines = collectAbsoluteLinks($);

        $("script, style, noscript, svg, footer").remove();

        const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        const pageContent =
          linkLines.length > 0
            ? `${bodyText}\n\nLinks:\n${linkLines.join("\n")}`
            : bodyText;

        const metadata = {
          source: filePathToSourceUrl(filePath),
        };
        const doc = new Document({
          pageContent,
          metadata,
        });

        resolve(doc);
      }
    });
  });
}

async function processDirectory(directoryPath: string): Promise<Document[]> {
  const docs: Document[] = [];
  let files: string[];
  try {
    files = fs.readdirSync(directoryPath);
  } catch (err) {
    console.error(err);
    throw new Error(
      `Could not read directory: ${directoryPath}. Did you run \`sh downloadLady.sh\`?`,
    );
  }
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const nestedDocs = await processDirectory(filePath);
      docs.push(...nestedDocs);
    } else if (file.endsWith(".html")) {
      const doc = await processFile(filePath);
      docs.push(doc);
    }
  }
  return docs;
}

class ReadTheDocsLoader extends BaseDocumentLoader {
  constructor(public filePath: string) {
    super();
  }
  async load(): Promise<Document[]> {
    return await processDirectory(this.filePath);
  }
}

const directoryPath = "ladyahorro.com";
const loader = new ReadTheDocsLoader(directoryPath);

export const run = async () => {
  const rawDocs = await loader.load();
  console.log("Loader created.");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await textSplitter.splitDocuments(rawDocs);
  console.log("Docs splitted.");

  console.log("Creating vector store...");
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  await vectorStore.save("data");
};

(async () => {
  await run();
  console.log("done");
})();
