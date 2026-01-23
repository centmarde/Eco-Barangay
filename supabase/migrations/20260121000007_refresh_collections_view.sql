-- Refresh collections_with_user_info view to include is_hazardous column
-- This is necessary because the view was created before the is_hazardous column was added

-- Drop the view first to handle column changes (PostgreSQL doesn't allow changing column names/types/order with CREATE OR REPLACE VIEW easily if * is used and table changes)
DROP VIEW IF EXISTS public.collections_with_user_info;

create or replace view public.collections_with_user_info as
select
  c.*,
  pr.email as requester_email,
  pr.full_name as requester_name,
  pc.email as collector_email,
  pc.full_name as collector_name
from public.collections c
left join public.profiles pr on c.request_by::uuid = pr.id
left join public.profiles pc on c.collector_assign::uuid = pc.id;