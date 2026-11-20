import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from "../api/jobs";
import type { Job } from "../api/jobs";

/**
 * Mock functions for the Supabase client and its query methods.
 * Each method returns the next method in the Supabase call chain.
 */
const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  deleteCall: vi.fn(),
  deleteEq: vi.fn(),
  single: vi.fn(),
}));

/**
 * Replace the real Supabase client with our mock.
 * This keeps the tests from connecting to the database.
 */
vi.mock("../supabase/client", () => ({
  createClient: mocks.createSupabaseClient,
}));

/**
 * Sample job record based on the jobs table schema.
 * The fixture is returned by the mock; it is not inserted into Supabase.
 */
const job = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  client_id: "33333333-3333-4333-8333-333333333333",
  title: "Kitchen Remodel",
  description: "Update cabinets and countertops",
  status: "pending",
  amount: 12500,
  billed: false,
  paid: false,
  created_at: "2026-11-18T12:00:00Z",
  updated_at: "2026-11-18T12:00:00Z",
} as Job;

describe("listJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from("jobs") → select("*") → order(...)
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ order: mocks.order });
  });

  it("returns the jobs from the database", async () => {
    // The last call in the chain returns the fake Supabase response.
    mocks.order.mockResolvedValue({ data: [job], error: null });

    const result = await listJobs();

    // Check that the function queried and sorted the jobs as expected.
    expect(mocks.from).toHaveBeenCalledWith("jobs");
    expect(mocks.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toEqual([job]);
  });
});

describe("getJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → select → eq → maybeSingle
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  });

  it("returns the job with the requested ID", async () => {
    // maybeSingle is the final Supabase call, so it returns the fake record.
    mocks.maybeSingle.mockResolvedValue({ data: job, error: null });

    const result = await getJob(job.id);

    // Check the table and ID filter, then check the returned value.
    expect(mocks.from).toHaveBeenCalledWith("jobs");
    expect(mocks.eq).toHaveBeenCalledWith("id", job.id);
    expect(result).toEqual(job);
  });
});

describe("createJobRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → insert → select → single
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
  });

  it("creates a job and returns the new record", async () => {
    const input = {
      client_id: job.client_id,
      title: "Kitchen Remodel",
      description: "Update cabinets and countertops",
      status: "pending",
      amount: 12500,
      billed: false,
      paid: false,
    };

    // single returns the fake row created by Supabase.
    mocks.single.mockResolvedValue({ data: job, error: null });

    const result = await createJob(input);

    // Check the table, inserted input, and returned record.
    expect(mocks.from).toHaveBeenCalledWith("jobs");
    expect(mocks.insert).toHaveBeenCalledWith(input);
    expect(result).toEqual(job);
  });
});

describe("updateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → update → eq → select → single
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ update: mocks.update });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
  });

  it("updates a job and returns the updated record", async () => {
    const changes = { title: "Updated Kitchen Remodel" };

    // single returns the fake updated row.
    mocks.single.mockResolvedValue({ data: job, error: null });

    const result = await updateJob(job.id, changes);

    // Check the table, updated values, ID filter, and returned record.
    expect(mocks.from).toHaveBeenCalledWith("jobs");
    expect(mocks.update).toHaveBeenCalledWith(changes);
    expect(mocks.eq).toHaveBeenCalledWith("id", job.id);
    expect(result).toEqual(job);
  });
});

describe("deleteJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → delete → eq
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ delete: mocks.deleteCall });
    mocks.deleteCall.mockReturnValue({ eq: mocks.deleteEq });
  });

  it("deletes the job with the requested ID", async () => {
    // deleteJob checks for an error; this response means deletion succeeded.
    mocks.deleteEq.mockResolvedValue({ error: null });

    const result = await deleteJob(job.id);

    // Check that it targeted the jobs table and requested ID.
    expect(mocks.from).toHaveBeenCalledWith("jobs");
    expect(mocks.deleteCall).toHaveBeenCalled();
    expect(mocks.deleteEq).toHaveBeenCalledWith("id", job.id);
    expect(result).toBeUndefined();
  });
});