import requests

url = "http://127.0.0.1:8000/upload-pdf"
files = {'file': ('test.txt', 'dummy content')}

print("Sending request to backend...")
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
