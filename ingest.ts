import { load } from "cheerio";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import * as fs from "fs";
import path from "path";

const SITE_ORIGIN = "https://ladyahorro.com";

const filePathToSourceUrl = (filePath: string): string => {
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
};

const collectAbsoluteLinks = (
  $: ReturnType<typeof load>,
): string[] => {
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
      // Skip invalid hrefs.
    }
  });

  return [...new Set(links)];
};

const processFile = async (filePath: string): Promise<Document> => {
  const fileContents = await fs.promises.readFile(filePath, "utf8");
  const $ = load(fileContents);

  const linkLines = collectAbsoluteLinks($);

  $("script, style, noscript, svg, footer").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const pageContent =
    linkLines.length > 0
      ? `${bodyText}\n\nLinks:\n${linkLines.join("\n")}`
      : bodyText;

  return new Document({
    pageContent,
    metadata: {
      source: filePathToSourceUrl(filePath),
    },
  });
};

const processDirectory = async (
  directoryPath: string,
): Promise<Document[]> => {
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
};

class ReadTheDocsLoader extends BaseDocumentLoader {
  constructor(public filePath: string) {
    super();
  }

  async load(): Promise<Document[]> {
    return processDirectory(this.filePath);
  }
}

const directoryPath = "ladyahorro.com";
const loader = new ReadTheDocsLoader(directoryPath);

export const run = async () => {
  const rawDocs = await loader.load();

  console.log("Loader created.");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);

  console.log("Docs splitted.");
  console.log("Creating vector store...");

  return MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings(),
  );
};