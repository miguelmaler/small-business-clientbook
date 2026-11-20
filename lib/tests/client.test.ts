import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  listClients,
  getClient,
  createClientRecord,
  updateClient,
  deleteClient,
} from "../api/clients";
import type { Client } from "../api/clients";

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
 * Sample database record returned by the mocked Supabase calls.
 * Add any other required Client fields from your generated database type.
 */
const client = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "John Smith",
} as Client;

describe("listClients", () => {
  beforeEach(() => {
    // Clear previous call history before each test.
    vi.clearAllMocks();

    // Mock the chain: from("clients") → select("*") → order(...)
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ order: mocks.order });
  });

  it("returns the clients from the database", async () => {
    // The last call in the chain returns the fake Supabase response.
    mocks.order.mockResolvedValue({ data: [client], error: null });

    const result = await listClients();

    // Check that the function queried and sorted the clients as expected.
    expect(mocks.from).toHaveBeenCalledWith("clients");
    expect(mocks.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toEqual([client]);
  });
});

describe("getClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → select → eq → maybeSingle
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  });

  it("returns the client with the requested ID", async () => {
    // maybeSingle is the final Supabase call, so it returns the fake record.
    mocks.maybeSingle.mockResolvedValue({ data: client, error: null });

    const result = await getClient(client.id);

    // Check the table and ID filter, then check the returned value.
    expect(mocks.from).toHaveBeenCalledWith("clients");
    expect(mocks.eq).toHaveBeenCalledWith("id", client.id);
    expect(result).toEqual(client);
  });
});

describe("createClientRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → insert → select → single
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
  });

  it("creates a client and returns the new record", async () => {
    const input = {
      name: "John Smith",
      phone: "555-0100",
      address: "123 Main Street",
    };

    // single returns the fake row created by Supabase.
    mocks.single.mockResolvedValue({ data: client, error: null });

    const result = await createClientRecord(input);

    // Check the table, inserted input, and returned record.
    expect(mocks.from).toHaveBeenCalledWith("clients");
    expect(mocks.insert).toHaveBeenCalledWith(input);
    expect(result).toEqual(client);
  });
});

describe("updateClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → update → eq → select → single
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ update: mocks.update });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
  });

  it("updates a client and returns the updated record", async () => {
    const changes = { name: "John Updated" };

    // single returns the fake updated row.
    mocks.single.mockResolvedValue({ data: client, error: null });

    const result = await updateClient(client.id, changes);

    // Check the table, updated values, ID filter, and returned record.
    expect(mocks.from).toHaveBeenCalledWith("clients");
    expect(mocks.update).toHaveBeenCalledWith(changes);
    expect(mocks.eq).toHaveBeenCalledWith("id", client.id);
    expect(result).toEqual(client);
  });
});

describe("deleteClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the chain: from → delete → eq
    mocks.createSupabaseClient.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ delete: mocks.deleteCall });
    mocks.deleteCall.mockReturnValue({ eq: mocks.deleteEq });
  });

  it("deletes the client with the requested ID", async () => {
    // deleteClient checks for an error; this response means deletion succeeded.
    mocks.deleteEq.mockResolvedValue({ error: null });

    const result = await deleteClient(client.id);

    // Check that it targeted the clients table and requested ID.
    expect(mocks.from).toHaveBeenCalledWith("clients");
    expect(mocks.deleteCall).toHaveBeenCalled();
    expect(mocks.deleteEq).toHaveBeenCalledWith("id", client.id);
    expect(result).toBeUndefined();
  });
});