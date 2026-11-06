import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("passages", Path(__file__).with_name("build-search-passages.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Passages(unittest.TestCase):
    def test_extracts_rendered_anchors_and_answer_bearing_steps(self):
        title, chunks = module.sections("""
          <html><h1>Add a Member</h1><nav>Ignore menu</nav>
          <div class="sl-markdown-content"><p>Create a profile.</p>
          <div><h2 id="create-a-profile">Create a profile</h2><a class="sl-anchor-link">Section link</a></div>
          <ol><li>Click New Member.</li><li>Choose <strong>Lead</strong>.</li></ol>
          <h2 id="member-types">Member types</h2><p>A Lead is a prospective student.</p></div></html>""")
        self.assertEqual(title, "Add a Member")
        self.assertEqual(chunks[1]["anchor"], "create-a-profile")
        self.assertIn("Choose Lead.", chunks[1]["text"])
        self.assertNotIn("Ignore menu", str(chunks))
        self.assertNotIn("Section link", str(chunks))
        self.assertEqual(chunks[2]["text"], "A Lead is a prospective student.")

    def test_rejects_missing_or_unsafe_rendered_anchors(self):
        with self.assertRaises(ValueError):
            module.sections('<h1>Guide</h1><div class="sl-markdown-content"><h2>Unverified</h2></div>')

    def test_bounds_long_sections_without_dropping_words(self):
        text = "one two three four five " * 400
        parts = list(module.split_text(text.strip()))
        self.assertTrue(all(len(part) <= 1900 for part in parts))
        self.assertEqual(" ".join(parts).split(), text.split())

    def test_export_lifecycle_and_stable_verified_mapping(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            article = '<h1>Add a Member</h1><div class="sl-markdown-content"><h2 id="create-a-profile">Create a profile</h2><p>Choose Lead.</p></div>'
            for name in ["members/add-member", "other/guide", "excluded/guide"]:
                target = root / name / "index.html"
                target.parent.mkdir(parents=True)
                target.write_text(article)
            aliases = {"/members/add-member/#create-a-profile": ["register a prospect"]}
            (root / "search-aliases.json").write_text(json.dumps(aliases))

            def export(paths):
                urls = "".join(f"<url><loc>{module.ORIGIN}/{path}/</loc><lastmod>2026-10-24T00:00:00Z</lastmod></url>" for path in paths)
                (root / "kai-sitemap.xml").write_text(
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + "</urlset>"
                )
                with patch.object(module, "__file__", str(root / "export.py")):
                    module.build(root)
                return json.loads((root / "kai-passages.json").read_text())["passages"]

            first = export(["members/add-member", "other/guide"])
            self.assertEqual(len(first), 2)
            self.assertNotEqual(first[0]["source_url"], first[1]["source_url"])
            self.assertEqual(first[0]["anchor"], "create-a-profile")
            self.assertNotIn("register a prospect", first[0]["excerpt"])
            identity = first[0]["source_url"].split("/")[-2]
            indexed_html = (root / "kai-passages" / identity / "index.html").read_text()
            self.assertIn("register a prospect", indexed_html)
            self.assertIn("Choose Lead.", indexed_html)
            self.assertNotIn('name="robots" content="noindex"', indexed_html)
            self.assertNotIn("excluded/guide", (root / "kai-passages.json").read_text())

            (root / "members/add-member/index.html").write_text(article.replace("Choose Lead.", "Choose Lead, then save."))
            second = export(["members/add-member"])
            self.assertEqual(first[0]["source_url"], second[0]["source_url"])
            self.assertIn("then save", second[0]["excerpt"])
            removed = first[1]["source_url"].split("/")[-2]
            self.assertFalse((root / "kai-passages" / removed).exists())
            self.assertNotIn(first[1]["source_url"], (root / "kai-search-sitemap.xml").read_text())

    def test_table_cells_keep_readable_word_boundaries(self):
        _, chunks = module.sections('<h1>Guide</h1><div class="sl-markdown-content"><table><tr><th>Profile</th><th>Use</th></tr><tr><td>Lead</td><td>Prospective student</td></tr></table></div>')
        self.assertIn("Lead\nProspective student", chunks[0]["text"])


if __name__ == "__main__":
    unittest.main()
