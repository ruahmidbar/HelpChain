{
  "name": "Notification",
  "type": "object",
  "properties": {
    "to_user_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05de\u05e7\u05d1\u05dc"
    },
    "from_user_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05e9\u05d5\u05dc\u05d7"
    },
    "type": {
      "type": "string",
      "enum": [
        "\u05d1\u05e7\u05e9\u05ea_\u05e2\u05d6\u05e8\u05d4",
        "\u05d4\u05e6\u05e2\u05ea_\u05e2\u05d6\u05e8\u05d4"
      ],
      "description": "\u05e1\u05d5\u05d2 \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4"
    },
    "subject_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05ea\u05d7\u05d5\u05dd"
    },
    "study_material": {
      "type": "string",
      "description": "\u05d7\u05d5\u05de\u05e8 \u05d4\u05dc\u05d9\u05de\u05d5\u05d3"
    },
    "proposed_date": {
      "type": "string",
      "format": "date",
      "description": "\u05ea\u05d0\u05e8\u05d9\u05da \u05de\u05d5\u05e6\u05e2"
    },
    "proposed_time": {
      "type": "string",
      "description": "\u05e9\u05e2\u05d4 \u05de\u05d5\u05e6\u05e2\u05ea"
    },
    "duration": {
      "type": "string",
      "description": "\u05de\u05e9\u05da \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "place": {
      "type": "string",
      "description": "\u05de\u05e7\u05d5\u05dd \u05d4\u05e4\u05d2\u05d9\u05e9\u05d4"
    },
    "message": {
      "type": "string",
      "description": "\u05d4\u05d5\u05d3\u05e2\u05d4 \u05e0\u05d5\u05e1\u05e4\u05ea"
    },
    "status": {
      "type": "string",
      "enum": [
        "\u05de\u05de\u05ea\u05d9\u05df",
        "\u05de\u05d0\u05d5\u05e9\u05e8",
        "\u05e0\u05d3\u05d7\u05d4"
      ],
      "default": "\u05de\u05de\u05ea\u05d9\u05df",
      "description": "\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "\u05d4\u05d0\u05dd \u05d4\u05d4\u05d5\u05d3\u05e2\u05d4 \u05e0\u05e7\u05e8\u05d0\u05d4"
    }
  },
  "required": [
    "to_user_id",
    "from_user_id",
    "type"
  ]
}