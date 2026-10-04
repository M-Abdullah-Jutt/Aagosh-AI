import re

file_path = r"e:\Agentic AI Projects\Aagosh AI\frontend\src\pages\Coach\CoachPage.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = r"\{t\('common.backToProfile', \{ name: child\?\.first_name \|\| t\('coach.childLabelFallback'\) \}\)\}"
replacement = r"<ArrowLeft className=\"w-4 h-4\" />\n            <span>{t('common.backToProfile', { name: child?.first_name || t('coach.childLabelFallback') })}</span>"

content = re.sub(target, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CoachPage.jsx")
