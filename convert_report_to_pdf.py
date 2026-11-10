import os
import sys
import re
from markdown_it import MarkdownIt
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QTextDocument, QPageSize, QPageLayout
from PyQt6.QtCore import QMarginsF
from PyQt6.QtPrintSupport import QPrinter

def generate_pdf():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(base_dir, 'PROJECT_REPORT.md')
    html_path = os.path.join(base_dir, 'PROJECT_REPORT.html')
    pdf_path = os.path.join(base_dir, 'PROJECT_REPORT.pdf')

    print(f"Reading markdown from: {md_path}")
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Pre-process: replace \newpage with a page break element
    md_text = re.sub(r'\\newpage', '<div style="page-break-before: always; height: 1px;"></div>', md_text)

    # Initialize Markdown parser with table support
    md = MarkdownIt().enable('table')
    body_html = md.render(md_text)

    # Enhance tables with explicit HTML attributes for Qt QTextDocument table rendering
    body_html = re.sub(
        r'<table>',
        r'<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #333333; margin-top: 12px; margin-bottom: 16px;">',
        body_html
    )
    body_html = re.sub(
        r'<th>',
        r'<th style="background-color: #f1f5f9; font-weight: bold; border: 1px solid #333333; padding: 6px 10px; text-align: left;">',
        body_html
    )
    body_html = re.sub(
        r'<td>',
        r'<td style="border: 1px solid #333333; padding: 6px 10px; vertical-align: middle;">',
        body_html
    )

    # Replace CU image with a stylized official banner
    cu_banner = """
    <div style="text-align: center; margin: 25px 0;">
        <table align="center" style="border: none; border-collapse: collapse; margin: 0 auto;">
            <tr>
                <td style="border: none; background-color: #c4122f; color: #ffffff; font-family: 'Arial Black', Arial, sans-serif; font-size: 20pt; font-weight: bold; padding: 8px 18px; letter-spacing: 1px;">
                    CHANDIGARH
                </td>
                <td style="border: none; background-color: #1b263b; color: #ffffff; font-family: 'Arial Black', Arial, sans-serif; font-size: 20pt; font-weight: bold; padding: 8px 18px; letter-spacing: 1px;">
                    UNIVERSITY
                </td>
            </tr>
            <tr>
                <td colspan="2" style="border: none; text-align: center; padding-top: 5px; font-family: Arial, sans-serif; font-size: 10pt; color: #475569; letter-spacing: 2px;">
                    Discover &bull; Learn &bull; Empower
                </td>
            </tr>
        </table>
    </div>
    """
    body_html = re.sub(r'<img[^>]*Chandigarh_University_seal[^>]*>', cu_banner, body_html)

    # Style preformatted blocks for diagrams/code
    body_html = re.sub(
        r'<pre><code>',
        r'<pre style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; font-family: Consolas, monospace; font-size: 9pt; line-height: 1.35; white-space: pre-wrap;"><code>',
        body_html
    )

    styled_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SpendFlow - Project Report</title>
<style>
  body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111111;
    margin: 0;
    padding: 0;
    text-align: justify;
  }}

  h1 {{
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
    margin-top: 28px;
    margin-bottom: 12px;
    page-break-before: always;
  }}

  /* Don't page-break before the first heading (Title Page) */
  body > h1:first-child,
  div:first-child h1 {{
    page-break-before: avoid;
    text-align: center;
  }}

  h2 {{
    font-size: 14pt;
    font-weight: bold;
    color: #0f172a;
    margin-top: 22px;
    margin-bottom: 10px;
  }}

  h3 {{
    font-size: 12.5pt;
    font-weight: bold;
    color: #1e293b;
    margin-top: 16px;
    margin-bottom: 8px;
  }}

  h4 {{
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  p {{
    margin-top: 8px;
    margin-bottom: 10px;
  }}

  ul, ol {{
    margin-top: 6px;
    margin-bottom: 10px;
    padding-left: 24px;
  }}

  li {{
    margin-bottom: 4px;
  }}

  a {{
    color: #0284c7;
    text-decoration: underline;
  }}

  blockquote {{
    border-left: 3px solid #0284c7;
    background-color: #f0f9ff;
    padding: 8px 14px;
    margin: 12px 0;
    font-style: italic;
  }}

  hr {{
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 24px 0;
  }}

  .page-break {{
    page-break-before: always;
  }}
</style>
</head>
<body>
{body_html}
</body>
</html>"""

    # Save HTML
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(styled_html)
    print(f"Saved styled HTML to: {html_path}")

    # Initialize Qt Application and QPrinter
    app = QApplication(sys.argv)

    printer = QPrinter(QPrinter.PrinterMode.HighResolution)
    printer.setOutputFormat(QPrinter.OutputFormat.PdfFormat)
    printer.setOutputFileName(pdf_path)
    printer.setPageSize(QPageSize(QPageSize.PageSizeId.A4))
    printer.setPageMargins(QMarginsF(18, 18, 18, 18), QPageLayout.Unit.Millimeter)

    doc = QTextDocument()
    doc.setHtml(styled_html)
    doc.print(printer)

    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        file_size_kb = os.path.getsize(pdf_path) // 1024
        print(f"SUCCESS: Generated PDF at {pdf_path} ({file_size_kb} KB)")
        return True
    else:
        print("ERROR: PDF was not generated properly.")
        return False

if __name__ == '__main__':
    generate_pdf()
