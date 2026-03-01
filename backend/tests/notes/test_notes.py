from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_list_notes_empty(client: TestClient) -> None:
    resp = client.get("/api/v1/notes/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_create_note(client: TestClient) -> None:
    payload = {"author": "Ben", "title": "Shopping list", "body": "Milk, eggs"}
    resp = client.post("/api/v1/notes/", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == 1
    assert data["author"] == "Ben"
    assert data["title"] == "Shopping list"
    assert data["body"] == "Milk, eggs"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_note_title_only(client: TestClient) -> None:
    payload = {"author": "Wife", "title": "Reminder"}
    resp = client.post("/api/v1/notes/", json=payload)
    assert resp.status_code == 201
    assert resp.json()["body"] is None


def test_create_note_invalid_author(client: TestClient) -> None:
    resp = client.post("/api/v1/notes/", json={"author": "Unknown", "title": "Test"})
    assert resp.status_code == 422


def test_create_note_empty_title(client: TestClient) -> None:
    resp = client.post("/api/v1/notes/", json={"author": "Ben", "title": ""})
    assert resp.status_code == 422


def test_get_note(client: TestClient) -> None:
    create = client.post("/api/v1/notes/", json={"author": "Ben", "title": "Test note"})
    note_id = create.json()["id"]
    resp = client.get(f"/api/v1/notes/{note_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test note"


def test_get_note_not_found(client: TestClient) -> None:
    resp = client.get("/api/v1/notes/9999")
    assert resp.status_code == 404


def test_list_notes_with_author_filter(client: TestClient) -> None:
    client.post("/api/v1/notes/", json={"author": "Ben", "title": "Ben note"})
    client.post("/api/v1/notes/", json={"author": "Wife", "title": "Wife note"})

    resp = client.get("/api/v1/notes/?author=Ben")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["author"] == "Ben"

    resp = client.get("/api/v1/notes/?author=Wife")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_patch_note(client: TestClient) -> None:
    create = client.post(
        "/api/v1/notes/", json={"author": "Ben", "title": "Old title", "body": "Old body"}
    )
    note_id = create.json()["id"]

    resp = client.patch(f"/api/v1/notes/{note_id}", json={"title": "New title"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "New title"
    assert data["body"] == "Old body"  # unchanged


def test_patch_note_not_found(client: TestClient) -> None:
    resp = client.patch("/api/v1/notes/9999", json={"title": "x"})
    assert resp.status_code == 404


def test_patch_note_blank_title_rejected(client: TestClient) -> None:
    create = client.post("/api/v1/notes/", json={"author": "Ben", "title": "Keep me"})
    note_id = create.json()["id"]
    resp = client.patch(f"/api/v1/notes/{note_id}", json={"title": "   "})
    assert resp.status_code == 422


def test_delete_note(client: TestClient) -> None:
    create = client.post("/api/v1/notes/", json={"author": "Wife", "title": "To delete"})
    note_id = create.json()["id"]

    resp = client.delete(f"/api/v1/notes/{note_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/v1/notes/{note_id}")
    assert resp.status_code == 404


def test_delete_note_not_found(client: TestClient) -> None:
    resp = client.delete("/api/v1/notes/9999")
    assert resp.status_code == 404
