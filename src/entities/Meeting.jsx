{
  "name": "Meeting",
  "type": "object",
  "properties": {
    "helper_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05e2\u05d5\u05d6\u05e8"
    },
    "requester_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05de\u05d1\u05e7\u05e9"
    },
    "subject_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05ea\u05d7\u05d5\u05dd"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "\u05ea\u05d0\u05e8\u05d9\u05da \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "time": {
      "type": "string",
      "description": "\u05e9\u05e2\u05ea \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "duration": {
      "type": "string",
      "description": "\u05de\u05e9\u05da \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4 \u05d1\u05d3\u05e7\u05d5\u05ea"
    },
    "place": {
      "type": "string",
      "description": "\u05de\u05e7\u05d5\u05dd \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "status": {
      "type": "string",
      "enum": [
        "\u05de\u05de\u05ea\u05d9\u05df \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8",
        "\u05de\u05d0\u05d5\u05e9\u05e8",
        "\u05d4\u05ea\u05e7\u05d9\u05d9\u05dd",
        "\u05d1\u05d5\u05d8\u05dc"
      ],
      "default": "\u05de\u05de\u05ea\u05d9\u05df \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8",
      "description": "\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "notes": {
      "type": "string",
      "description": "\u05d4\u05e2\u05e8\u05d5\u05ea \u05dc\u05e4\u05e0\u05d9 \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    }
  },
  "required": [
    "helper_id",
    "requester_id",
    "subject_id",
    "date",
    "time",
    "duration",
    "place"
  ]
}