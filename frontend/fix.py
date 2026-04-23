import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix type imports (verbatimModuleSyntax)
    content = re.sub(r'import {([^}]*RootState[^}]*)} from', r'import type { \1 } from', content)
    content = re.sub(r'import {([^}]*Role[^}]*)} from', r'import type { \1 } from', content)
    content = re.sub(r'import {([^}]*User[^}]*)} from', r'import type { \1 } from', content)
    
    # Also need to make sure we don't duplicate `type` if it's already there
    content = content.replace('import type type', 'import type')

    # Fix Grid item props (MUI v6)
    content = re.sub(r'<Grid item\s+xs={([^}]+)}\s+sm={([^}]+)}\s+lg={([^}]+)}\s*>', r'<Grid size={{xs: \1, sm: \2, lg: \3}}>', content)
    content = re.sub(r'<Grid item\s+xs={([^}]+)}\s+sm={([^}]+)}\s+md={([^}]+)}\s*>', r'<Grid size={{xs: \1, sm: \2, md: \3}}>', content)
    content = re.sub(r'<Grid item\s+xs={([^}]+)}\s+md={([^}]+)}\s*>', r'<Grid size={{xs: \1, md: \2}}>', content)
    content = re.sub(r'<Grid item\s+xs={([^}]+)}\s+sm={([^}]+)}\s*>', r'<Grid size={{xs: \1, sm: \2}}>', content)
    content = re.sub(r'<Grid item\s+xs={([^}]+)}\s*>', r'<Grid size={{xs: \1}}>', content)
    content = re.sub(r'<Grid item([^>]*)>', r'<Grid \1>', content)

    # Fix fontWeight prop on Typography. 
    # Because of `sx` conflicts, we will just use a global replace.
    # fontWeight="bold" -> sx={{ fontWeight: 'bold' }}
    # if it already has sx={{...}}, we might have a problem. Let's do a simple regex that merges if needed, or just append.
    # A safer way for this prototype is to replace fontWeight="bold" with sx={{ fontWeight: 'bold' }}. If there is another sx, we'll fix it manually.
    content = re.sub(r'fontWeight="([^"]+)"', r'sx={{ fontWeight: "\1" }}', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_file(os.path.join(root, file))
