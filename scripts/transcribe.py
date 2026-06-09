import json
import os
import sys


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing audio path"}))
        return

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            json.dumps(
                {
                    "error": "faster-whisper is not installed. Run: pip install -r requirements-whisper.txt"
                }
            )
        )
        return

    audio_path = sys.argv[1]
    model_name = os.environ.get("STILLVOICE_WHISPER_MODEL", "small")

    model = WhisperModel(model_name, device="auto", compute_type="auto")
    segments, _info = model.transcribe(
        audio_path,
        beam_size=5,
        vad_filter=True,
        language=None,
        initial_prompt=(
            "This is a personal voice note. Preserve Hinglish, Indian names, "
            "proper nouns, technical terms, and product names such as GraphRAG."
        ),
    )

    transcript = " ".join(segment.text.strip() for segment in segments).strip()
    print(json.dumps({"transcript": transcript}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
