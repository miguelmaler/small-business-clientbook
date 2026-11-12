import { create } from "domain";
import { createClient as createSupabaseClient } from "../supabase/client";
import type { Database } from "../types/database.types";

type JobTable = Database["public"]["Tables"]["jobs"];

export type Job = JobTable["Row"];

export type CreateJobInput =
    Pick<JobTable["Insert"], "client_id" | "title"> &
    Partial<
        Pick<JobTable["Insert"], "description" | "status" | "amount" | "billed" | "paid">
    >;

export type UpdateJobInput = Partial<
    Pick<
        JobTable["Update"],
        "client_id" | "title" | "description" | "status" | "amount" | "billed" | "paid"
    >
>;

export async function listJobs(): Promise<Job[]> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false});

    if (error) throw error;
    return data;
}

export async function getJob(id: string): Promise<Job | null> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    
    if (error) throw error;
    return data;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("jobs")
        .insert(input)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}

export async function updateJob(
    id: string,
    changes: UpdateJobInput,
): Promise<Job> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("jobs")
        .update(changes)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}

export async function deleteJob(id: string): Promise<void> {
    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

    if (error) throw error;
}