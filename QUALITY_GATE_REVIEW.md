# Quality Gate Review Record

| Quality Gate area | Finding | Action taken | Evidence |
|---|---|---|---|
| Reliability | Self-conflict during update: Updating a booking flagged itself as an overlap. | Excluded current `bookingId` (`AND id != ?`) in overlap SQL query during PATCH. | Executed PATCH on booking `bk-1`; returned `200` without false conflict. |
| Accuracy | Invalid dates: Submitting `startAt` after `endAt` caused database corruption. | Added pre-query date validation (`startDate >= endDate`). | Tested request #6; returned `400` with `{ "error": "startAt must be valid and before endAt" }`. |
| Reasoning | Missing equipment check: Non-existent `equipmentId` failed silently. | Validated `equipmentId` against `equipment` table before creating/updating. | Request with `equipmentId: "invalid"` returns `400` error message. |