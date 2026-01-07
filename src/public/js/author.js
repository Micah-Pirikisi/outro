// public/js/author.js
const apiBase = "/api/v1";
let token = localStorage.getItem("sanctuary_token");

function setAuth(t) {
  token = t;
  if (t) localStorage.setItem("sanctuary_token", t);
  else localStorage.removeItem("sanctuary_token");
  document.getElementById("dashboard").style.display = t ? "block" : "none";
  document.getElementById("auth").style.display = t ? "none" : "block";
  if (t) loadPosts();
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
  const res = await fetch(`${apiBase}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  // For authoring, we need drafts too — call protected endpoint to list all posts by author
  const postsRes = await fetch(`${apiBase}/posts?per=100&page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const postsData = await postsRes.json();
  const list = document.getElementById("posts-list");
  list.innerHTML = "";
  postsData.posts.forEach((p) => {
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
      const r = await fetch(`/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const post = await r.json();
      document.getElementById("editor").style.display = "block";
      document.getElementById("post-id").value = post.id;
      document.getElementById("post-title").value = post.title;
      document.getElementById("post-excerpt").value = post.excerpt || "";
      document.getElementById("post-content").value = post.content || "";
      document.getElementById("post-tags").value = (post.tags || []).join(",");
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

document.getElementById("preview-btn").addEventListener("click", () => {
  const title = document.getElementById("post-title").value || "Untitled";
  const content = document.getElementById("post-content").value || "<p>No content</p>";
  const excerpt = document.getElementById("post-excerpt").value;
  
  const previewHtml = `
    <h1 style="font-size: 48px; font-weight: 400; margin: 0 0 30px 0;">${title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h1>
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

// initialize
setAuth(token);
