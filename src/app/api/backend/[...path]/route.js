import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  return proxyRequest(request, params);
}

export async function POST(request, { params }) {
  return proxyRequest(request, params);
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params);
}

export async function PATCH(request, { params }) {
  return proxyRequest(request, params);
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params);
}

async function proxyRequest(request, params) {
  const { path } = await params;
  const pathname = Array.isArray(path) ? path.join("/") : path;
  const searchParams = request.nextUrl.search;
  
  // Ensure we maintain the trailing slash if the original request had it
  const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");
  const targetPath = pathname + (hasTrailingSlash ? "/" : "");
  
  // The actual backend URL
  const backendBase = "https://docugyan-backend.onrender.com";
  const backendUrl = `${backendBase}/${targetPath}${searchParams}`;
  
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.set("origin", backendBase);
  headers.set("referer", backendBase + "/");
  
  // Bypass CSRF for login endpoints by removing cookies (they don't need them)
  if (targetPath.includes("Login_SignUp") || targetPath.includes("google")) {
    headers.delete("cookie");
  }

  try {
    let body = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const json = await request.json().catch(() => null);
          if (json) body = JSON.stringify(json);
        } else if (contentType?.includes("multipart/form-data")) {
          body = await request.formData().catch(() => null);
          if (body) headers.delete("content-type");
        } else {
          body = await request.blob().catch(() => null);
        }
      } catch (e) {
        console.error("Error reading request body:", e);
      }
    }

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
      cache: "no-store",
    });

    console.log(`[Backend Proxy] ${request.method} ${targetPath} -> ${response.status} ${response.statusText}`);

    // Use a fresh response to avoid issues with immutable headers
    const newHeaders = new Headers();
    const headersToSkip = ["set-cookie", "content-encoding", "content-length", "transfer-encoding"];
    
    response.headers.forEach((value, key) => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        newHeaders.set(key, value);
      }
    });

    if (response.status === 403) {
       const text = await response.text();
       console.log(`[Backend Proxy] 403 Body:`, text);
       return new Response(text, {
          status: 403,
          headers: newHeaders
       });
    }
    
    // Handle cookies specifically: Strip Domain so browser saves them for localhost/netlify
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Split multiple cookies correctly
      const cookies = setCookie.split(/,(?=\s*[A-Za-z0-9_-]+=)/g);
      cookies.forEach(c => {
        const cleaned = c.replace(/Domain=[^;]+(; )?/, "");
        newHeaders.append("set-cookie", cleaned);
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy failed", details: error.message }, { status: 502 });
  }
}
