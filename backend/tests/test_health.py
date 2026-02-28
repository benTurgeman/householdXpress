from fastapi.testclient import TestClient


def test_docs_reachable(client: TestClient) -> None:
    response = client.get("/docs")
    assert response.status_code == 200
