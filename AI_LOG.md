# AI Log

- **Prompt Used:** "How to write SQL overlap query for booking system in SQLite?"
- **AI Suggestion Provided:** Recommended using `startAt < newEnd AND endAt > newStart`.
- **Verification Performed:** Tested with edge cases (exact start/end matches, overlapping ranges) using `tests.http` requests #3 and #7. Confirmed correct `409` conflict status returned.