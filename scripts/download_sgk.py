"""download_sgk.py — Tải SGK "Kết nối tri thức" từ taphuan.nxbgd.vn về tai-lieu-sgk/ (KHÔNG commit,
xem .gitignore). Đọc book_discovery.json (tự tạo bằng cách duyệt trang chi-tiet-sach/... trên
taphuan.nxbgd.vn) rồi tải từng trang PNG của mỗi sách.

Cách dùng: soạn book_discovery.json (mảng theo lớp, mỗi sách có title/subject/doc_sach_url), rồi
chạy `python scripts/download_sgk.py`. Xem docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md để
biết bối cảnh (dùng để tải Hoá/Sinh 10-12 + Chuyên đề học tập Vật lí 10-12, 2026-08-31).
"""
import os
import sys
import re
import json
import urllib.request
import ssl
import concurrent.futures
from urllib.error import URLError

context = ssl._create_unverified_context()

def fetch_html(url):
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, context=context) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def download_image(url, dest_path, attempt=1, max_attempts=3):
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, context=context, timeout=20) as response:
            with open(dest_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        if attempt < max_attempts:
            return download_image(url, dest_path, attempt + 1, max_attempts)
        print(f"Failed to download {url} to {dest_path} after {max_attempts} attempts: {e}")
        return False

def main():
    if not os.path.exists("book_discovery.json"):
        print("book_discovery.json not found. Run discovery first.")
        return

    with open("book_discovery.json", "r", encoding="utf-8") as f:
        discovery = json.load(f)

    # Build the list of books to download
    books_to_download = []
    
    for grade_str, books in discovery.items():
        grade = int(grade_str)
        for book in books:
            title = book["title"]
            subject = book["subject"]
            doc_url = book["doc_sach_url"]
            
            # Determine directory name
            sub_dir = ""
            if subject == "Hóa học":
                sub_dir = "SGK-Hoa"
            elif subject == "Sinh học":
                sub_dir = "SGK-Sinh"
            elif subject == "Vật lí":
                sub_dir = "SGK-Ly"
            else:
                continue
                
            # If it's Physics, we only want specialized topics (since main text is already done)
            if subject == "Vật lí" and "chuyên đề" not in title.lower():
                continue
                
            # Folder naming logic
            if "chuyên đề" in title.lower():
                folder_name = f"{grade}-chuyende"
            else:
                folder_name = f"{grade}"
                
            target_path = os.path.join("tai-lieu-sgk", sub_dir, folder_name)
            
            books_to_download.append({
                "title": title,
                "doc_sach_url": doc_url,
                "target_path": target_path
            })

    print(f"Found {len(books_to_download)} books to process:")
    for b in books_to_download:
        print(f"  - {b['title']} -> {b['target_path']}")

    # Process books
    for b in books_to_download:
        title = b["title"]
        doc_url = b["doc_sach_url"]
        target_path = b["target_path"]
        
        print(f"\nProcessing book: {title}...")
        os.makedirs(target_path, exist_ok=True)
        
        # Get page URLs
        html = fetch_html(doc_url)
        if not html:
            print(f"Could not load doc-sach page for {title}")
            continue
            
        match = re.search(r'download_book_pages_urls\s*:\s*(\[.*?\])', html, re.DOTALL)
        if not match:
            print(f"Could not find page URLs for {title}")
            continue
            
        urls = json.loads(match.group(1))
        print(f"Found {len(urls)} pages for {title}")
        
        # Check if already fully downloaded
        existing_files = [f for f in os.listdir(target_path) if f.startswith("page_") and f.endswith(".png")]
        if len(existing_files) == len(urls):
            print(f"Book {title} is already fully downloaded ({len(existing_files)} pages). Skipping.")
            continue
            
        # Download pages in parallel
        # Save pages as page_0001.png, page_0002.png, etc.
        download_tasks = []
        for idx, page_url in enumerate(urls):
            file_name = f"page_{idx+1:04d}.png"
            dest = os.path.join(target_path, file_name)
            download_tasks.append((page_url, dest))
            
        print(f"Downloading {len(download_tasks)} pages to {target_path}...")
        
        success_count = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(download_image, task[0], task[1]): task for task in download_tasks}
            for future in concurrent.futures.as_completed(futures):
                task = futures[future]
                if future.result():
                    success_count += 1
                    
        print(f"Finished {title}: successfully downloaded {success_count}/{len(urls)} pages.")

if __name__ == "__main__":
    main()
