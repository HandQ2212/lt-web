import os
import glob
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(r'import\s+([A-Za-z0-9_]+Icon)\s+from\s+[\'\"].?@mui/icons-material/([A-Za-z0-9_]+)[\'\"];', r'import { \2 as \1 } from \'@mui/icons-material\';', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Fixed {filepath}')
