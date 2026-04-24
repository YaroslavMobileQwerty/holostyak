insert into public.app_settings (key, value) values
  ('donation_jar_url', '"https://send.monobank.ua/jar/9UvMyzSLwd"'::jsonb),
  ('donation_card', '"4874100026934243"'::jsonb),
  ('donation_disclaimer', '"100% зібраних коштів йде на підтримку ЗСУ 🇺🇦"'::jsonb),
  ('donation_qr_url', '""'::jsonb),
  ('bet_close_minutes', '60'::jsonb),
  ('active_season_id', '"00000000-0000-0000-0000-000000000001"'::jsonb)
on conflict (key) do nothing;
