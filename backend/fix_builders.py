import os
import re

def fix_builders(directory):
    for root, dirs, files in os.walk(directory):
        if "entity" in root:
            for file in files:
                if file.endswith(".java"):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    if "extends BaseEntity" in content and "@Builder" in content and "@SuperBuilder" not in content:
                        print(f"Fixing {file}")
                        # Thay the @Builder thanh @SuperBuilder
                        content = re.sub(r'@Builder\b(?!.*\.)', '@SuperBuilder', content)
                        # Them import neu chua co
                        if "import lombok.experimental.SuperBuilder;" not in content:
                            content = content.replace("import lombok.*;", "import lombok.*;\nimport lombok.experimental.SuperBuilder;")
                        
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(content)

fix_builders(r"d:\DaiHoc\Nam3\LT WEB\elc-system\backend\src\main\java\com\elc\system\modules")
