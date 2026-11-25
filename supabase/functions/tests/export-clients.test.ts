import exportClients from '../export-clients/index.ts';

declare const Deno: {
    test(name: string, fn: () => void | Promise<void>): void;
    env: {
        delete(arg0: string): unknown;
        get(name: string): string | undefined;
        set(name: string, value: string): void;
    };
};

declare const globalThis: {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
};

function assertEquals(actual: unknown, expected: unknown, message: string) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

Deno.test("export-clients handles requests and creates an XLSX response", async () => {
    const originalFetch = globalThis.fetch;
    const originalUrl = Deno.env.get("SUPABASE_URL");
    const originalAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    Deno.env.set("SUPABASE_URL", "https://test-project.supabase.co");
    Deno.env.set("SUPABASE_ANON_KEY", "test-anon-key");

    const fakeClients = [
        {
        id: "client-uuid-1",
        name: "Test Client",
        email: "client@example.com",
        phone: "801-555-0100",
        address: "123 Test Street",
        notes: "Test note",
        created_at: "2026-11-25T12:00:00Z",
        },
    ];

    let databaseShouldFail = false;

    // Replace fetch so the test doesn't call a real Supabase database
    globalThis.fetch = async (input, init) => {
        const outgoingRequest = new Request(input, init);
        const url = outgoingRequest.url;

        if (!url.includes("/rest/v1/clients")) {
            return Response.json (
                { message: `Unexpected request URL: ${url}` },
                { status: 404 }
            );
        }

        if (databaseShouldFail) {
            return Response.json(
                {
                    code: "42501",
                    message: "permission denied for table clients",
                },
                { status: 403 }
            );
        }

        return Response.json(fakeClients, {
            status: 200,
            headers: {
                "Content-Range": "0-0/1",
            },
        });
    };

    try {
        // POST should be rejected
        const methodResponse = await exportClients.fetch(
            new Request("https://test.local/export-clients", { method: "POST" })
        );
        assertEquals(methodResponse.status, 405, "POST request should be rejected");

        // GET without Authorization should be rejected
        const authResponse = await exportClients.fetch(
            new Request("https://test.local/export-clients", { method: "GET" })
        );
        assertEquals(authResponse.status, 401, "Rejects requests without auth");

        // GET with a placeholder Authorization header should produce XLSX bytes.
        // This direct handler test does not verify JWT signatures.
        const successResponse = await exportClients.fetch(
            new Request("https://test.local/export-clients", {
                method: "GET",
                headers: {
                    Authorization: "Bearer test-token",
                },
            })
        );
        assertEquals(successResponse.status, 200, "Returns success");
        assertEquals(
            successResponse.headers.get("Content-Disposition"),
            "attachment; filename=clients.xlsx",
            "Sets the download filename"
        );

        const bytes = new Uint8Array(await successResponse.arrayBuffer());
        assertEquals(bytes[0], 0x50, "XLSX starts with the ZIP signature");
        assertEquals(bytes[1], 0x4B, "XLSX starts with the ZIP signature");

        // Simulate a database permission error and check 500 branch
        databaseShouldFail = true;

        const databaseErrorResponse = await exportClients.fetch(
            new Request("https://test.local/export-clients", {
                method: "GET",
                headers: {
                    Authorization: "Bearer test-token",
                },
            })
        );

        assertEquals(databaseErrorResponse.status, 500, "Returns 500 on DB error");

        const errorBody = await databaseErrorResponse.json();
        assertEquals(
            errorBody.error,
            "Could not export clients",
            "Returns the expected database error response"
        );
    } finally {
        globalThis.fetch = originalFetch;

        if (originalUrl === undefined) {
            Deno.env.delete("SUPABASE_URL");
        } else {
            Deno.env.set("SUPABASE_URL", originalUrl);
        }

        if (originalAnonKey === undefined) {
            Deno.env.delete("SUPABASE_ANON_KEY");
        } else {
            Deno.env.set("SUPABASE_ANON_KEY", originalAnonKey);
        }
    }
});