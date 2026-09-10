import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    // Gunakan Better Auth langsung (lebih efisien, tidak perlu HTTP round-trip)
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Proteksi halaman admin - hanya role 'admin' yang boleh masuk
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!session || session.user?.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
    
    // Proteksi halaman my-list - hanya user yang sudah login
    if (request.nextUrl.pathname.startsWith("/my-list")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Jalankan proxy hanya di route ini
    matcher: ["/admin/:path*", "/my-list/:path*"],
};
