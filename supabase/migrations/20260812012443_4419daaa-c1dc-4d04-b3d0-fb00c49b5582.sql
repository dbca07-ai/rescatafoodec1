
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_daily_package_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.place_order(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, integer, text) TO authenticated;
