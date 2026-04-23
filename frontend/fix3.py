import os

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if r"\'@mui/icons-material\'" in content:
                content = content.replace(r"\'@mui/icons-material\'", "'@mui/icons-material'")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed backslashes in {filepath}")
