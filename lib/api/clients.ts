import { createClient as createSupabaseClient } from "../supabase/client";
import type { Database } from "../types/database.types"

type ClientTable = Database["public"]["Tables"]["clients"]

export type Client = ClientTable["Row"];

export type CreateClientInput =
    Pick<ClientTable["Insert"], "name" | "phone" | "address"> &
    Partial<Pick<ClientTable["Insert"], "email" | "notes">>;

export type UpdateClientInput = Partial<
    Pick<ClientTable["Update"], "name" | "phone" | "address" | "email" | "notes">
>;

export async function listClients(): Promise<Client[]> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false});

    if (error) throw error;
    return data;
}

export async function getClient(id: string): Promise<Client | null> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function createClientRecord(
    input: CreateClientInput,
): Promise<Client> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("clients")
        .insert(input)
        .select("*")
        .single();

    if (error) throw error;
    return data;    
}

export async function updateClient(
    id: string,
    changes: UpdateClientInput
): Promise<Client> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("clients")
        .update(changes)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}

export async function deleteClient(id: string): Promise<void> {
    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

    if (error) throw error;
}