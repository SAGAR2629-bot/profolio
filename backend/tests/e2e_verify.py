import httpx
import io
from PIL import Image

API_URL = "http://127.0.0.1:8000"
PORTFOLIO_URL = "http://127.0.0.1:5173"
ADMIN_URL = "http://127.0.0.1:5174"

def run_e2e_verification():
    client = httpx.Client(timeout=10.0)
    print("==================================================")
    print("STEP 1: Verify all 3 servers respond")
    print("==================================================")
    r_api = client.get(f"{API_URL}/api/health")
    assert r_api.status_code == 200, f"API failed: {r_api.status_code}"
    print("✓ Backend API is alive:", r_api.json())

    r_port = client.get(PORTFOLIO_URL)
    assert r_port.status_code == 200, f"Portfolio failed: {r_port.status_code}"
    print("✓ Public Portfolio (port 5173) is serving index.html")

    r_admin = client.get(ADMIN_URL)
    assert r_admin.status_code == 200, f"Admin CMS (port 5174) failed: {r_admin.status_code}"
    print("✓ Admin CMS (port 5174) is serving index.html")

    print("\n==================================================")
    print("STEP 2: Admin Login & JWT authentication")
    print("==================================================")
    login_res = client.post(f"{API_URL}/api/admin/login", json={"username": "admin", "password": "admin123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Admin authenticated successfully. Access token received.")

    # Me check
    me_res = client.get(f"{API_URL}/api/admin/me", headers=headers)
    assert me_res.status_code == 200
    print("✓ /api/admin/me identity confirmed:", me_res.json()["username"])

    print("\n==================================================")
    print("STEP 3: Dashboard Statistics")
    print("==================================================")
    stats_res = client.get(f"{API_URL}/api/admin/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    print("✓ Dashboard stats retrieved dynamically:")
    for k, v in stats.items():
        print(f"   {k}: {v}")

    print("\n==================================================")
    print("STEP 4: Critical Test — Edit Homepage Subtitle")
    print("==================================================")
    # Get current public subtitle
    pub_initial = client.get(f"{API_URL}/api/public/portfolio").json()
    old_sub = pub_initial.get("home_content", {}).get("hero_subtitle")
    print("Current Public Subtitle:", old_sub)

    # Change subtitle from CMS
    new_sub = "This content was changed from the CMS."
    home_data = pub_initial.get("home_content", {})
    home_data["hero_subtitle"] = new_sub
    update_res = client.put(f"{API_URL}/api/admin/content/home", json={"data": home_data}, headers=headers)
    assert update_res.status_code == 200, f"Update failed: {update_res.text}"
    print("✓ CMS updated subtitle to:", new_sub)

    # Verify public website API immediately reflects new text
    pub_updated = client.get(f"{API_URL}/api/public/portfolio").json()
    updated_sub = pub_updated.get("home_content", {}).get("hero_subtitle")
    assert updated_sub == new_sub, f"Expected '{new_sub}', got '{updated_sub}'"
    print("✓ Public API successfully reflects new subtitle:", updated_sub)

    print("\n==================================================")
    print("STEP 5: Critical Test — Multi-Image Project Gallery, Cover, Reordering")
    print("==================================================")
    # 1. Create a test project
    test_proj_payload = {
        "title": "MuJoCo Bipedal Robot",
        "slug": "mujoco-bipedal-robot",
        "short_description": "Dynamic walking and balance policy",
        "full_description": "Trained with SAC and domain randomization in MuJoCo",
        "year": "2026",
        "category": "Robotics",
        "technologies": ["MuJoCo", "Python", "PyTorch"],
        "status": "COMPLETED",
        "published": True
    }
    create_res = client.post(f"{API_URL}/api/admin/projects", json=test_proj_payload, headers=headers)
    assert create_res.status_code == 201, f"Project creation failed: {create_res.text}"
    proj_id = create_res.json()["id"]
    print(f"✓ Created project '{test_proj_payload['title']}' (ID: {proj_id})")

    # 2. Upload three test images (Red, Green, Blue)
    uploaded_media = []
    colors = [("red", "Red Diagram"), ("green", "Green Sensor"), ("blue", "Blue Telemetry")]
    for col, name in colors:
        img = Image.new("RGB", (300, 200), color=col)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        up_res = client.post(
            f"{API_URL}/api/admin/media/upload",
            files={"file": (f"{col}_test.jpg", buf, "image/jpeg")},
            data={"title": name, "alt_text": name},
            headers=headers
        )
        assert up_res.status_code == 201
        m_data = up_res.json()
        uploaded_media.append(m_data)
        print(f"   Uploaded media #{m_data['id']}: {col}_test.jpg ({m_data['width']}x{m_data['height']})")

    # 3. Attach all three to project gallery
    gallery_img_ids = []
    for idx, m in enumerate(uploaded_media):
        att_res = client.post(
            f"{API_URL}/api/admin/projects/{proj_id}/images",
            json={"media_id": m["id"], "caption": m["title"], "display_order": idx, "is_cover": (idx == 0)},
            headers=headers
        )
        assert att_res.status_code == 200
        gallery_img_ids.append(att_res.json()["id"])
        print(f"   Attached image {m['title']} to project gallery (Gallery ID: {att_res.json()['id']})")

    # 4. Set image #2 (Green Sensor) as cover
    # Reorder images: put green first (as cover), then blue, then red
    reorder_payload = [
        {"image_id": gallery_img_ids[1], "display_order": 0, "is_cover": True},
        {"image_id": gallery_img_ids[2], "display_order": 1, "is_cover": False},
        {"image_id": gallery_img_ids[0], "display_order": 2, "is_cover": False},
    ]
    reorder_res = client.put(f"{API_URL}/api/admin/projects/{proj_id}/images/reorder", json=reorder_payload, headers=headers)
    assert reorder_res.status_code == 200
    print("✓ Reordered images and set Image #2 (Green) as cover")

    # 5. Verify public project endpoint
    pub_proj = client.get(f"{API_URL}/api/public/projects/mujoco-bipedal-robot").json()
    assert pub_proj["image"] == uploaded_media[1]["public_url"], f"Cover mismatch: {pub_proj['image']} vs {uploaded_media[1]['public_url']}"
    print(f"✓ Public project reflects Image #2 as cover: {pub_proj['image']}")

    # Verify gallery order in public project
    ordered_urls = [img["url"] for img in pub_proj["images"]]
    expected_urls = [uploaded_media[1]["public_url"], uploaded_media[2]["public_url"], uploaded_media[0]["public_url"]]
    assert ordered_urls == expected_urls, f"Order mismatch: {ordered_urls} vs {expected_urls}"
    print("✓ Public gallery reflects exact requested order: Green -> Blue -> Red")

    print("\n==================================================")
    print("STEP 6: Reference-Aware Delete Protection")
    print("==================================================")
    # Attempting to delete media[1] while attached must be rejected
    del_blocked = client.delete(f"{API_URL}/api/admin/media/{uploaded_media[1]['id']}", headers=headers)
    assert del_blocked.status_code == 400, f"Expected 400 rejection, got {del_blocked.status_code}"
    print("✓ Deletion blocked as expected because media is in use:", del_blocked.json()["detail"]["message"])

    # Clean up test project
    client.delete(f"{API_URL}/api/admin/projects/{proj_id}", headers=headers)
    print("✓ Test project cleaned up successfully")

    # Now media can be deleted safely
    for m in uploaded_media:
        client.delete(f"{API_URL}/api/admin/media/{m['id']}?force=true", headers=headers)
    print("✓ Cleaned up test media files")

    print("\n==================================================")
    print("🎉 ALL END-TO-END VERIFICATION CHECKS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_e2e_verification()
