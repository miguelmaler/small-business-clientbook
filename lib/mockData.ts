export const MOCK_USERS = [
  {
    id: 1,
    name: "Luciano Gutierrez",
    email: "luciano@example.com",
    phone: "+1 555-0192",
    password: "password123"
  }
];

export const MOCK_CLIENTS = [
  {
    id: 1,
    name: "Acme Solar Corp",
    email: "contact@acmesolar.com",
    phone: "+1 555-8392",
    address: "123 Energy Blvd, American Fork, UT",
    notes: "Prefer email communication regarding grid maintenance."
  },
  {
    id: 2,
    name: "GreenValley Power",
    email: "",
    phone: "+1 555-4920",
    address: "456 Peak Rd, Orem, UT",
    notes: "Gate code is #4321."
  }
];

export const MOCK_JOBS = [
  {
    id: 1,
    jobTitle: "Inverter Maintenance",
    description: "Inspect secondary grid inverter and check telemetry cables.",
    status: "pending",
    amount: 350.00,
    billed: true,
    paid: false,
    timestamp: "2026-11-06 10:00 AM"
  },
  {
    id: 2,
    jobTitle: "Battery Bank Diagnostics",
    description: "Run diagnostic suite on storage cluster packs.",
    status: "done",
    amount: 500.00,
    billed: true,
    paid: true,
    timestamp: "2026-11-05 02:30 PM"
  }
];