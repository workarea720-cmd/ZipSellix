import os

def list_files(startpath):
    exclude = {'.git', 'node_modules', '.next', '__pycache__', 'venv'}
    for root, dirs, files in os.walk(startpath):
        dirs[:] = [d for d in dirs if d not in exclude]
        level = root.replace(startpath, '').count(os.sep)
        indent = '  ' * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = '  ' * (level + 1)
        for f in sorted(files):
            print(f"{subindent}{f}")

if __name__ == '__main__':
    list_files(os.getcwd())
