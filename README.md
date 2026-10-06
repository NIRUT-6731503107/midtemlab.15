# Campus Equipment Booking API

**Course:** 2026_PlatformDev  
**Student Name:** Nirut Chuenban
**Student ID:** 6731503107  
**Date:** October 6, 2026  

---

## Project Overview

This project is a RESTful API backend built for managing and reserving shared campus resources (e.g., projectors, cameras, meeting rooms). It provides endpoints for listing available equipment and performing full CRUD operations on bookings with built-in time collision checking, parameter binding, and standardized error handling.

---

## Tech Stack & Frameworks

* **Runtime:** Cloudflare Workers / Node.js
* **Framework:** [Hono.js](https://hono.dev/)
* **Database:** SQLite / Cloudflare D1
* **Language:** TypeScript
* **Testing:** HTTP Client / cURL / PowerShell / REST Client (`tests.http`)

---

## Features & Business Logic

1. **Equipment Management:** Retrieve shared resource records.
2. **Bookings CRUD:** Complete Create, Read, Update, and Delete operations for reservation records.
3. **Collision Detection:** Prevents double-booking by enforcing the condition that no two bookings for the same equipment can overlap in time ($start_A < end_B \text{ AND } end_A > start_B$).
4. **Data Security:** Strict parameter binding via D1 (`.bind(...)`) to prevent SQL Injection attacks.
5. **Standardized Responses:** Uniform JSON responses and correct HTTP status codes (`200`, `201`, `204`, `400`, `404`, `409`).
6. **CORS Support:** Enabled across all endpoints for cross-origin browser requests.

---

## Local Setup & Run Instructions

### Prerequisites
* Node.js (v18+)
* npm

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/NIRUT-6731503107/midtemlab.15.git](https://github.com/NIRUT-6731503107/midtemlab.15.git)
cd midtemlab.15
npm install
