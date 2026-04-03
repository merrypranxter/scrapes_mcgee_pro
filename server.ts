import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Octokit } from "octokit";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // GitHub Push Endpoint
  app.post("/api/github/push", async (req, res) => {
    const { filename, content, repo: requestedRepo } = req.body;
    const token = process.env.GITHUB_TOKEN;
    const defaultRepo = process.env.GITHUB_REPO;
    let repo = requestedRepo || defaultRepo;

    if (!token) {
      return res.status(500).json({ error: "GITHUB_TOKEN not configured in Secrets" });
    }
    if (!repo) {
      return res.status(400).json({ error: "No repository specified. Set GITHUB_REPO in Secrets or specify one." });
    }

    // Clean up repo string (handle full URLs)
    if (repo.includes("github.com/")) {
      repo = repo.split("github.com/")[1].replace(".git", "").split("?")[0];
    }
    
    const parts = repo.split("/").filter(Boolean);
    if (parts.length < 2) {
      return res.status(400).json({ error: `Invalid repository format: "${repo}". Use 'owner/repo' format.` });
    }
    const owner = parts[0];
    const repoName = parts[1];

    const octokit = new Octokit({ auth: token });

    try {
      // Check if file exists to get its SHA (needed for update)
      let sha: string | undefined;
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo: repoName,
          path: filename,
        });
        if (!Array.isArray(data)) {
          sha = data.sha;
        }
      } catch (e: any) {
        if (e.status !== 404) throw e;
      }

      // Create or update file
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: filename,
        message: `Scrapes McGee: Dump ${filename}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      });

      res.json({ success: true, url: `https://github.com/${owner}/${repoName}/blob/main/${filename}` });
    } catch (error: any) {
      console.error("GitHub Push Error:", error);
      res.status(500).json({ error: error.message || "Failed to push to GitHub" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
