import type { Config, Context } from "@netlify/functions";
import { Octokit } from "octokit";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { filename, content, repo: requestedRepo } = await req.json();
  const token = Netlify.env.get("GITHUB_TOKEN");
  const defaultRepo = Netlify.env.get("GITHUB_REPO");
  let repo = requestedRepo || defaultRepo;

  if (!token) {
    return Response.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }
  if (!repo) {
    return Response.json(
      {
        error:
          "No repository specified. Set GITHUB_REPO env var or specify one.",
      },
      { status: 400 }
    );
  }

  // Clean up repo string (handle full URLs)
  if (repo.includes("github.com/")) {
    repo = repo.split("github.com/")[1].replace(".git", "").split("?")[0];
  }

  const parts = repo.split("/").filter(Boolean);
  if (parts.length < 2) {
    return Response.json(
      { error: `Invalid repository format: "${repo}". Use 'owner/repo' format.` },
      { status: 400 }
    );
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
      if (!Array.isArray(data) && "sha" in data) {
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
      content: btoa(unescape(encodeURIComponent(content))),
      sha,
    });

    return Response.json({
      success: true,
      url: `https://github.com/${owner}/${repoName}/blob/main/${filename}`,
    });
  } catch (error: any) {
    console.error("GitHub Push Error:", error);
    return Response.json(
      { error: error.message || "Failed to push to GitHub" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/github/push",
  method: "POST",
};
