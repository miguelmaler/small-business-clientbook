// @ts-ignore: Supabase Edge Functions resolve npm imports through Deno.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "xlsx";

interface DenoEnvironment {
    env: {
        get(name: string): string | undefined;
    };
}

interface DenoGlobal {
    Deno: DenoEnvironment;
}

interface ClientExportRow {
    name: string;
    email: string | null;
    phone: string;
    address: string;
    notes: string | null;
}

interface ExportHandler {
    fetch(request: Request): Promise<Response>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default {
    fetch: async (request: Request): Promise<Response> => {
        if (request.method === "OPTIONS") {
            return new Response("ok", { headers: corsHeaders });
        }

        if (request.method !== "GET") {
            return Response.json(
                { error: "Use GET to export clients"},
                { status: 405 }
            );
        }

        const deno = (globalThis as typeof globalThis & {
            Deno: { env: { get(name: string): string | undefined } };
        }).Deno;
        const supabaseUrl = deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = deno.env.get("SUPABASE_ANON_KEY");
        const authorization = request.headers.get("Authorization");

        if (!supabaseUrl || !supabaseAnonKey || !authorization) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authorization } },
        });

        // This Supabase client uses the signed-in user's permissions and RLS policies.
        const { data: clients, error } = await supabase
            .from("clients")
            .select("name, email, phone, address, notes")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Client export query failed:", error);
            return Response.json(
                { error: "Could not export clients" },
                { status: 500 }
            );
        }

        const worksheet = XLSX.utils.aoa_to_sheet([
            ["Name", "Email", "Phone", "Address", "Notes"],
            ...(clients ?? []).map((client: { name: any; email: any; phone: any; address: any; notes: any; }) => [
                client.name,
                client.email ?? "",
                client.phone,
                client.address,
                client.notes ?? "",
            ]),
        ]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

        // Generate the .xlsx file as bytes for the HTTP response.
        const fileBytes = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        return new Response(fileBytes, {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=clients.xlsx",
                "Cache-Control": "no-store",
            },
        });
    },
};