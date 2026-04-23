import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            # Revert MUI icon imports
            content = re.sub(r'import\s+\{\s*([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+Icon)\s*\}\s+from\s+[\'"]@mui/icons-material[\'"];', r'import \2 from \'@mui/icons-material/\1\';', content)
            
            # Fix PayloadAction
            content = content.replace('import { createSlice, PayloadAction }', 'import { createSlice, type PayloadAction }')

            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {filepath}")
