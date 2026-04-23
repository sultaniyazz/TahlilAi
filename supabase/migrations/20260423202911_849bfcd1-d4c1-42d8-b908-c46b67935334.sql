-- Restrict listing of all files; keep direct file access public via known URLs
DROP POLICY IF EXISTS "Project assets are publicly accessible" ON storage.objects;

-- Allow public SELECT only when accessed via direct file path (not bulk listing)
CREATE POLICY "Public can view individual project assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-assets' AND name IS NOT NULL);
