-- =====================================================
-- SCRUM-20 Dummy Data
-- Creates test clients and jobs for RLS testing
-- =====================================================

-- CLIENTS

INSERT INTO public.clients
(user_id, name, email, phone, address, notes)
VALUES
(
  '0298424c-52a1-4e5b-9d1e-d24adc6d20e7',
  'John Smith',
  'john.smith@example.com',
  '555-111-1111',
  '123 Main Street',
  'Kitchen remodeling client'
);

INSERT INTO public.clients
(user_id, name, email, phone, address, notes)
VALUES
(
  '2ce15452-dbeb-47cd-9b17-39bbf2715284',
  'Mary Johnson',
  'mary.johnson@example.com',
  '555-222-2222',
  '456 Oak Avenue',
  'Bathroom renovation client'
);