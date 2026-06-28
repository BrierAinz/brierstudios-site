<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title><xsl:value-of select="/rss/channel/title"/> — RSS</title>
<style>
:root { --bg:#060810; --card:#101620; --gold:#c9a84c; --gold-bright:#e0c878; --text:#cbd5e1; --muted:#64748b; --border:#182030; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 2rem; line-height: 1.6; }
.container { max-width: 48rem; margin: 0 auto; }
h1 { color: var(--gold); font-family: 'Cinzel', serif; font-size: 2rem; margin: 0 0 0.5rem; letter-spacing: 0.05em; }
.subtitle { color: var(--muted); margin-bottom: 2rem; }
.feed-info { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 2rem; }
.feed-info p { margin: 0.25rem 0; }
.feed-info a { color: var(--gold); text-decoration: none; }
.feed-info a:hover { color: var(--gold-bright); text-decoration: underline; }
.item { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
.item h2 { margin: 0 0 0.5rem; font-size: 1.125rem; }
.item h2 a { color: var(--gold); text-decoration: none; }
.item h2 a:hover { color: var(--gold-bright); text-decoration: underline; }
.item .meta { color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
.item .desc { color: var(--text); }
.footer { margin-top: 3rem; text-align: center; color: var(--muted); font-size: 0.875rem; }
.footer a { color: var(--gold); text-decoration: none; }
</style>
</head>
<body>
<div class="container">
<h1><xsl:value-of select="/rss/channel/title"/></h1>
<p class="subtitle"><xsl:value-of select="/rss/channel/description"/></p>

<div class="feed-info">
<p><strong>Subscribe:</strong> Copy this URL into <a href="https://feedly.com/i/subscription/feed/<xsl:value-of select="/rss/channel/atom:link/@href"/>">Feedly</a>, <a href="https://www.inoreader.com?add_feed=<xsl:value-of select="/rss/channel/atom:link/@href"/>">Inoreader</a>, or any RSS reader.</p>
<p><strong>Feed URL:</strong> <a href="<xsl:value-of select="/rss/channel/atom:link/@href"/>"><xsl:value-of select="/rss/channel/atom:link/@href"/></a></p>
<p><strong>Last update:</strong> <xsl:value-of select="/rss/channel/lastBuildDate"/></p>
</div>

<xsl:for-each select="/rss/channel/item">
<div class="item">
<h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
<div class="meta"><xsl:value-of select="pubDate"/></div>
<div class="desc"><xsl:value-of select="description"/></div>
</div>
</xsl:for-each>

<div class="footer">
<p>This is an RSS feed. <a href="/">Back to BrierStudios</a></p>
</div>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>