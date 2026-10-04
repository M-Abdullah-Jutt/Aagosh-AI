import re

file_path = r"e:\Agentic AI Projects\Aagosh AI\frontend\src\pages\Coach\CoachPage.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
if 'import { ArrowLeft } from \'lucide-react\';' not in content:
    content = content.replace(
        "import { ANALYSIS_PERIODS } from '../../utils/checkInConstants';",
        "import { ANALYSIS_PERIODS } from '../../utils/checkInConstants';\nimport { ArrowLeft } from 'lucide-react';"
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CoachPage.jsx")
