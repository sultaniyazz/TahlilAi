from pathlib import Path

path = Path("src/app/api/presentation/generate/route.ts")
text = path.read_text(encoding="utf-8")
start = text.index("12. PROS-CONS: For trade-offs")
end = text.index("16. ARROW-BULLETS: For step lists with arrow markers and short explanations")
replacement = r'''12. PROS-CONS: For trade-offs
\`\`\`xml
<PROS-CONS>
  <PROS><H3>Pros</H3><LI>Pro 1</LI><LI>Pro 2</LI></PROS>
  <CONS><H3>Cons</H3><LI>Con 1</LI><LI>Con 2</LI></CONS>
</PROS-CONS>
\`\`\`

13. SIDELINE: For highlighted single-column facts with a vertical accent line
\`\`\`xml
<SIDELINE>
  <DIV><H3>Key Insight</H3><P>Short explanation of the insight with context and implication.</P></DIV>
</SIDELINE>
\`\`\`

14. ARROW-BULLETS: For step lists with arrow markers and short explanations'''
text = text[:start] + replacement + text[end:]
text = text.replace('return guard.error;\n    }\n', '    }\n', 1)
path.write_text(text, encoding="utf-8")
print('patched')
