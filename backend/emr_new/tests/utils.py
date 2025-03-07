from typing import Optional


class MockCurexaResponse:
    def __init__(self, content: Optional[str] = None) -> None:
        self.content = (
            content if content else '{"status": "success", "message": "Creation"}'
        )
