export type User = {
    id: string;
    email: string | null;
    name: string;
    phone_number: string | null;
};

export type Client = {
    id: string;
    owner_id: string;
    name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type JobStatus = 
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Cancelled";

export type Job = {
    id: string;
    owner_id: string;
    client_id: string;
    title: string;
    description: string | null;
    status: JobStatus;
    amount: number;
    paid: boolean;
    created_at: string;
    updated_at: string;
}