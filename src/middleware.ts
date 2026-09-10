import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Kita akan fetch dari endpoint auth yang sudah kita buat
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
            cookie: request.headers.get("cookie") || "",
        },
    });

    const session = await response.json();

    // Proteksi halaman admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // Asumsi session.user.role ada kalau sudah login
        if (!session || !session.session || session.user?.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
    
    // Proteksi halaman my-list (hanya user login)
    if (request.nextUrl.pathname.startsWith("/my-list")) {
        if (!session || !session.session) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Jalankan middleware hanya di route ini
    matcher: ["/admin/:path*", "/my-list/:path*"],
};
