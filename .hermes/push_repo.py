import subprocess, json, os

token = "***NEW_TOKEN***"

# First verify the token
r = subprocess.run(["curl", "-s", "-H", f"Authorization: Bearer *** "https://api.github.com/user"], capture_output=True, text=True, timeout=10)
user_data = json.loads(r.stdout)
username = user_data.get("login", "unknown")
print(f"Authenticated as: {username}")

# Create repo
r = subprocess.run(["curl", "-s", "-X", "POST", "https://api.github.com/user/repos",
 "-H", f"Authorization: Bearer *** "-H", "Accept: application/vnd.github.v3+json",
 "-d", '{"name":"coderetain","description":"Daily coding practice App","private":false}'],
 capture_output=True, text=True, timeout=15)
data = json.loads(r.stdout)

if "clone_url" in data:
    clone_url = data["clone_url"]
    print(f"Repo CREATED: {clone_url}")
elif data.get("message", "").startswith("name already exists"):
    r2 = subprocess.run(["curl", "-s", f"https://api.github.com/repos/{username}/coderetain",
     "-H", f"Authorization: Bearer *** capture_output=True, text=True, timeout=10)
    d2 = json.loads(r2.stdout)
    clone_url = d2["clone_url"]
    print(f"Repo EXISTS: {clone_url}")
else:
    print(f"ERROR: {r.stdout[:300]}")
    exit(1)

# Push code
os.chdir(r"C:\Users\14533\hermes_agent\coderetain")
push_url = clone_url.replace("https://", f"https://{username}:{token}@")

# Remove old origin if any
subprocess.run(["git", "remote", "rm", "origin"], capture_output=True, text=True, timeout=5)
subprocess.run(["git", "remote", "add", "origin", push_url], capture_output=True, text=True, timeout=5)

r = subprocess.run(["git", "push", "-u", "origin", "master"], capture_output=True, text=True, timeout=60)
stdout = r.stdout[-300:] if r.stdout else ""
stderr = r.stderr[-300:] if r.stderr else ""
print(f"Push stdout: {stdout}")
print(f"Push stderr: {stderr}")
if r.returncode == 0:
    print("SUCCESS! Code pushed to GitHub!")
    print(f"Repo URL: https://github.com/{username}/coderetain")
else:
    print(f"Push failed with code {r.returncode}")
