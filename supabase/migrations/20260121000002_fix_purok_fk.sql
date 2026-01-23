-- Modify foreign key to allow deletion of collections
alter table "public"."purok_monitoring"
drop constraint if exists "purok_monitoring_collection_id_fkey";

alter table "public"."purok_monitoring"
add constraint "purok_monitoring_collection_id_fkey"
foreign key ("collection_id")
references "public"."collections" ("id")
on delete set null;
