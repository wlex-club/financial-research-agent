"""Financial Research Agent — competition demo entrypoint."""

from __future__ import annotations

import subprocess
import sys


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "streamlit":
        subprocess.run(
            [
                sys.executable,
                "-m",
                "streamlit",
                "run",
                "app.py",
                "--server.headless",
                "true",
            ],
            check=True,
        )
        return

    import os
    import uvicorn

    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
