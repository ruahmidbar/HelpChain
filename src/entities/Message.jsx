{
  "name": "Message",
  "type": "object",
  "properties": {
    "from_user_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05e9\u05d5\u05dc\u05d7"
    },
    "to_user_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05de\u05e7\u05d1\u05dc"
    },
    "subject_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05ea\u05d7\u05d5\u05dd (\u05d0\u05d5\u05e4\u05e6\u05d9\u05d5\u05e0\u05dc\u05d9)"
    },
    "content": {
      "type": "string",
      "description": "\u05ea\u05d5\u05db\u05df \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4"
    },
    "meeting_details": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string"
        },
        "time": {
          "type": "string"
        },
        "duration": {
          "type": "string"
        },
        "place": {
          "type": "string"
        },
        "subject_id": {
          "type": "string"
        }
      },
      "description": "\u05e4\u05e8\u05d8\u05d9 \u05e4\u05d2\u05d9\u05e9\u05d4 \u05de\u05d5\u05e6\u05e2\u05ea"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "\u05d4\u05d0\u05dd \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4 \u05e0\u05e7\u05e8\u05d0\u05d4"
    },
    "type": {
      "type": "string",
      "enum": [
        "\u05d4\u05d5\u05d3\u05e2\u05d4 \u05e8\u05d2\u05d9\u05dc\u05d4",
        "\u05d4\u05e6\u05e2\u05ea \u05e4\u05d2\u05d9\u05e9\u05d4",
        "\u05d0\u05d9\u05e9\u05d5\u05e8 \u05e4\u05d2\u05d9\u05e9\u05d4"
      ],
      "default": "\u05d4\u05d5\u05d3\u05e2\u05d4 \u05e8\u05d2\u05d9\u05dc\u05d4",
      "description": "\u05e1\u05d5\u05d2 \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4"
    }
  },
  "required": [
    "from_user_id",
    "to_user_id",
    "content"
  ]
}