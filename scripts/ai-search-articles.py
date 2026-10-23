"""Extract the same single Starlight article used by AI Search, for offline evaluation."""

from html.parser import HTMLParser
import json
import sys

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Article(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.parts = []
        self.matches = 0
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "sl-markdown-content" in attrs.get("class", "").split():
            self.matches += 1
            if self.stack:
                raise ValueError("Nested article containers")
            self.stack.append(tag)
        elif self.stack and tag not in VOID_TAGS:
            self.stack.append(tag)
        if tag == "title":
            self.in_title = True

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if self.stack and tag == self.stack[-1]:
            self.stack.pop()
            self.parts.append(" ")
        if tag == "title":
            self.in_title = False
            self.parts.append(" ")

    def handle_data(self, text):
        if self.in_title or (self.stack and not {"script", "style"}.intersection(self.stack)):
            self.parts.append(text)


def extract(html):
    parser = Article()
    parser.feed(html)
    parser.close()
    if parser.matches != 1 or parser.stack:
        raise ValueError("Expected one complete .sl-markdown-content container")
    return " ".join(" ".join(parser.parts).split())


if __name__ == "__main__":
    pages = json.load(sys.stdin)
    json.dump([{"url": page["url"], "text": extract(page["html"])} for page in pages], sys.stdout)
