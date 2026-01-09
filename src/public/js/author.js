// public/js/author.js
const apiBase = "/api/v1";
let token = localStorage.getItem("sanctuary_token");

function setAuth(t) {
  token = t;
  if (t) localStorage.setItem("sanctuary_token", t);
  else localStorage.removeItem("sanctuary_token");
  document.getElementById("dashboard").style.display = t ? "block" : "none";
  document.getElementById("auth").style.display = t ? "none" : "block";
  if (t) {
    loadPosts();
    loadPendingComments();
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) setAuth(data.token);
  else alert("Login failed");
});

document
  .getElementById("logout")
  .addEventListener("click", () => setAuth(null));

async function loadPosts() {
  // For authoring, fetch protected list including drafts (only if we have a token)
  const list = document.getElementById("posts-list");
  list.innerHTML = "";
  if (!token) {
    // not authenticated: show an empty list or a message
    list.innerHTML =
      '<div style="color:#999">Log in to see your drafts and private posts.</div>';
    return;
  }

  const postsRes = await fetch(`${apiBase}/posts/me?per=200&page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!postsRes.ok) {
    if (postsRes.status === 401) {
      // token invalid or expired
      setAuth(null);
      alert("Session expired — please log in again");
      return;
    }
    // other errors
    console.error("Failed fetching author posts", postsRes.status);
    list.innerHTML = '<div style="color:#999">Unable to load your posts.</div>';
    return;
  }

  const postsData = await postsRes.json();
  const postsArray = (postsData && postsData.posts) || [];
  postsArray.forEach((p) => {
    const el = document.createElement("div");
    el.innerHTML = `<strong>${p.title}</strong> — ${
      p.status
    } <button data-id="${p.id}" class="edit">Edit</button> <button data-id="${
      p.id
    }" class="publish">${
      p.status === "published" ? "Unpublish" : "Publish"
    }</button> <button data-id="${p.id}" class="delete">Delete</button>`;
    list.appendChild(el);
  });

  // attach handlers
  document.querySelectorAll(".edit").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const r = await fetch(`/api/v1/posts/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const post = await r.json();
      document.getElementById("editor").style.display = "block";
      document.getElementById("post-id").value = post.id;
      document.getElementById("post-title").value = post.title;
      document.getElementById("post-excerpt").value = post.excerpt || "";
      document.getElementById("post-content").value = post.content || "";
      // set category select to the first tag (if any)
      document.getElementById("post-tags").value =
        (post.tags && post.tags[0]) || "";
      document.getElementById("post-status").value = post.status;
    })
  );

  document.querySelectorAll(".publish").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const current = e.target.textContent;
      const status = current === "Publish" ? "published" : "draft";
      await fetch(`/api/v1/posts/${id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadPosts();
    })
  );

  document.querySelectorAll(".delete").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      if (!confirm("Delete post?")) return;
      const id = e.target.dataset.id;
      await fetch(`/api/v1/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPosts();
    })
  );
}

document.getElementById("new-post").addEventListener("click", () => {
  document.getElementById("editor").style.display = "block";
  document.getElementById("post-form").reset();
  document.getElementById("post-id").value = "";
});

document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("post-id").value;
  const form = new FormData();
  form.append("title", document.getElementById("post-title").value);
  form.append("excerpt", document.getElementById("post-excerpt").value);
  form.append("content", document.getElementById("post-content").value);
  // tags is a single category value from the select
  form.append("tags", document.getElementById("post-tags").value);
  form.append("status", document.getElementById("post-status").value);
  const file = document.getElementById("coverImage").files[0];
  if (file) form.append("coverImage", file);

  const url = id ? `/api/v1/posts/${id}` : "/api/v1/posts";
  const method = id ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.ok) {
    alert("Saved");
    document.getElementById("editor").style.display = "none";
    loadPosts();
  } else {
    const err = await res.json();
    alert("Error: " + (err.error || JSON.stringify(err)));
  }
});

document.getElementById("cancel-edit").addEventListener("click", () => {
  document.getElementById("editor").style.display = "none";
});

document.getElementById("post-content").addEventListener("input", (e) => {
  const wordCount = e.target.value
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const display = document.getElementById("word-count-display");
  if (display) {
    display.textContent = `${wordCount} words (maximum 6000)`;
    // green when within limit, secondary when over
    display.style.color =
      wordCount <= 6000 ? "var(--success)" : "var(--text-secondary)";
  }
});

document.getElementById("preview-btn").addEventListener("click", () => {
  const title = document.getElementById("post-title").value || "Untitled";
  const content =
    document.getElementById("post-content").value || "<p>No content</p>";
  const excerpt = document.getElementById("post-excerpt").value;

  const previewHtml = `
    <h1 style="font-size: 48px; font-weight: 400; margin: 0 0 30px 0;">${title
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</h1>
    <div style="color: var(--text-secondary); margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid var(--border);">
      <span style="font-size: 14px;">Preview Mode</span>
    </div>
    <div style="line-height: 1.8; color: var(--text-primary);">${content}</div>
  `;

  document.getElementById("preview-content").innerHTML = previewHtml;
  document.getElementById("preview-modal").style.display = "block";
});

document.getElementById("close-preview").addEventListener("click", () => {
  document.getElementById("preview-modal").style.display = "none";
});

// Close preview when clicking outside the content
document.getElementById("preview-modal").addEventListener("click", (e) => {
  if (e.target.id === "preview-modal") {
    document.getElementById("preview-modal").style.display = "none";
  }
});

// Load pending comments
async function loadPendingComments() {
  const res = await fetch(`${apiBase}/comments/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("Failed fetching pending comments", res.status);
    return;
  }

  const data = await res.json();
  const comments = data.comments || [];
  const container = document.getElementById("pending-comments");
  container.innerHTML = "";

  if (comments.length === 0) {
    container.innerHTML = '<div style="color:#999">No pending comments.</div>';
    return;
  }

  comments.forEach((c) => {
    const el = document.createElement("div");
    el.style.cssText =
      "padding:20px; margin-bottom:20px; border:1px solid var(--border); background: var(--bg-secondary); border-radius: 4px;";
    el.innerHTML = `
      <div style="margin-bottom:10px;">
        <strong>${c.post.title}</strong>
        <span style="color:#999; font-size:12px;">(${c.post.slug})</span>
      </div>
      <div style="margin-bottom:10px;">
        <p style="margin:8px 0; font-size:14px;"><strong>${
          c.author || "Anonymous"
        }</strong> ${c.email ? `(${c.email})` : ""}</p>
        <p style="margin:8px 0; line-height:1.6; color: var(--text-secondary);">${
          c.body
        }</p>
        <p style="margin:8px 0; font-size:12px; color:#999;">
          ${new Date(c.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <button data-id="${
          c.id
        }" class="approve-comment" style="padding:8px 16px; background:var(--success); color:var(--bg-primary); border:none; cursor:pointer; font-size:12px; border-radius:3px;">Approve</button>
        <button data-id="${
          c.id
        }" class="delete-comment" style="padding:8px 16px; background:var(--error); color:var(--bg-primary); border:none; cursor:pointer; font-size:12px; border-radius:3px;">Delete</button>
      </div>
    `;
    container.appendChild(el);
  });

  // Attach event listeners to approve buttons
  document.querySelectorAll(".approve-comment").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await fetch(`${apiBase}/comments/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPendingComments();
    })
  );

  // Attach event listeners to delete buttons
  document.querySelectorAll(".delete-comment").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      if (!confirm("Delete comment?")) return;
      const id = e.target.dataset.id;
      await fetch(`${apiBase}/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPendingComments();
    })
  );
}

// initialize
setAuth(token);

// initialize
setAuth(token);
