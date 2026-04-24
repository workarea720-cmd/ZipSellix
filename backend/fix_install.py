import os
import zipfile
import urllib.request
import shutil
import subprocess
import sys

def install_basicsr():
    print("🚀 Starting Automatic BasicSR Fix...")
    
    # 1. Download
    url = "https://github.com/XPixelGroup/BasicSR/archive/master.zip"
    zip_path = "basicsr.zip"
    extract_path = "basicsr_temp"
    
    print("⬇️  Downloading BasicSR...")
    urllib.request.urlretrieve(url, zip_path)
    
    # 2. Extract
    print("📦 Extracting files...")
    if os.path.exists(extract_path):
        shutil.rmtree(extract_path)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    
    # 3. Find Setup File
    base_folder = os.path.join(extract_path, "BasicSR-master")
    setup_file = os.path.join(base_folder, "setup.py")
    
    # 4. Patch the Error (Magic Step)
    print("🔧 Fixing the code error...")
    with open(setup_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace the broken version function with a fixed one
    broken_code = """def get_version():
    version_file = 'basicsr/__init__.py'
    with open(version_file, 'r', encoding='utf-8') as f:
        exec(compile(f.read(), version_file, 'exec'))
    return locals()['__version__']"""
    
    fixed_code = """def get_version():
    return '1.4.2'"""
    
    # Use simple replace (if exact match fails, we append simple version)
    if broken_code in content:
        new_content = content.replace(broken_code, fixed_code)
    else:
        # Fallback: Just force the version variable if function looks different
        new_content = content.replace("version=get_version(),", "version='1.4.2',")
        
    with open(setup_file, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    # 5. Install
    print("💿 Installing patched version...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", base_folder])
    
    # 6. Cleanup
    print("🧹 Cleaning up...")
    os.remove(zip_path)
    shutil.rmtree(extract_path)
    
    print("✅ SUCCESS! BasicSR has been installed.")

if __name__ == "__main__":
    try:
        install_basicsr()
    except Exception as e:
        print(f"❌ Error: {e}")