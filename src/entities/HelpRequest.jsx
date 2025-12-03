{
  "name": "HelpRequest",
  "type": "object",
  "properties": {
    "requester_id": {
      "type": "string",
      "description": "\u05de\u05d6\u05d4\u05d4 \u05d4\u05ea\u05dc\u05de\u05d9\u05d3 \u05d4\u05de\u05d1\u05e7\u05e9 \u05e2\u05d6\u05e8\u05d4"
    },
    "subjects": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "\u05ea\u05d7\u05d5\u05de\u05d9 \u05d4\u05dc\u05d9\u05de\u05d5\u05d3 \u05d1\u05d4\u05dd \u05de\u05d1\u05e7\u05e9 \u05e2\u05d6\u05e8\u05d4 (\u05de\u05d6\u05d4\u05d9 Subject)"
    },
    "study_material": {
      "type": "string",
      "description": "\u05e4\u05e8\u05d8\u05d9 \u05d7\u05d5\u05de\u05e8 \u05d4\u05dc\u05d9\u05de\u05d5\u05d3 - \u05e1\u05e4\u05e8, \u05e2\u05de\u05d5\u05d3\u05d9\u05dd \u05d5\u05db\u05d5'"
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "\u05ea\u05d0\u05e8\u05d9\u05da \u05d4\u05ea\u05d7\u05dc\u05d4"
    },
    "end_date": {
      "type": "string",
      "format": "date",
      "description": "\u05ea\u05d0\u05e8\u05d9\u05da \u05e1\u05d9\u05d5\u05dd"
    },
    "available_hours": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "day": {
            "type": "string"
          },
          "start_time": {
            "type": "string"
          },
          "end_time": {
            "type": "string"
          }
        }
      },
      "description": "\u05e9\u05e2\u05d5\u05ea \u05d6\u05de\u05d9\u05e0\u05d5\u05ea"
    },
    "status": {
      "type": "string",
      "enum": [
        "\u05e4\u05e2\u05d9\u05dc",
        "\u05dc\u05d0 \u05e4\u05e2\u05d9\u05dc"
      ],
      "default": "\u05e4\u05e2\u05d9\u05dc",
      "description": "\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d4\u05d1\u05e7\u05e9\u05d4"
    }
  },
  "required": [
    "requester_id",
    "subjects",
    "start_date",
    "end_date"
  ]
}