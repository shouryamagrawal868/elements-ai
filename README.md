# 🎬 Elements AI

> AI-powered video analysis platform that extracts media assets, recognizes background music, and analyzes video content through an asynchronous processing pipeline.

---

# 🚀 Overview

Elements AI is a backend-first AI platform designed to help video creators automatically analyze uploaded videos.

The system currently supports:

- Video Upload
- Background Processing
- Audio Extraction
- Thumbnail Generation
- Music Recognition (Mock Provider)
- Asynchronous Job Queue
- Database Persistence

Future versions will detect:

- 🎵 Music
- 🔊 Sound Effects
- 🎨 Color Grading
- 📝 Fonts
- 😊 Faces
- 📦 Objects
- 🎬 Video Effects

---

# 🏗 Architecture

Client

↓

Express API

↓

Upload Service

↓

BullMQ Queue

↓

Redis

↓

Background Worker

↓

FFmpeg

├── Extract Audio

├── Generate Thumbnail

└── Music Recognition

↓

Prisma ORM

↓

MySQL

---

# 🛠 Tech Stack

## Backend

- TypeScript
- Node.js
- Express.js

## Database

- Prisma ORM
- MySQL

## Queue System

- BullMQ
- Redis

## Media Processing

- FFmpeg

## Containerization

- Docker

---

# ✅ Features Completed

### Upload Module

- Video Upload API
- File Validation
- Local Storage

### Background Processing

- BullMQ Worker
- Redis Queue
- Async Processing

### Media Processing

- Audio Extraction
- Thumbnail Generation

### Music Recognition

- Mock Recognition Provider
- Database Integration

### Database

- User Model
- Upload Model
- RecognitionResult Model
- Feedback Model
- ML Training Data Model

---

# 📂 Project Structure

src/
├── config/
├── jobs/
├── middleware/
├── modules/
│ ├── upload/
│ ├── media/
│ ├── musicRecognition/
│ ├── thumbnail/
│ ├── audio/
│ └── health/
├── prisma/
└── server.ts

---

# 🔄 Current Processing Flow

Upload Video

↓

Save Upload

↓

BullMQ Queue

↓

Worker

↓

Extract Audio

↓

Generate Thumbnail

↓

Recognize Music

↓

Save Recognition Result

↓

Completed

---

# 📌 Roadmap

## Phase 1 ✅

- Backend Foundation
- Redis
- BullMQ
- Docker
- FFmpeg
- Upload API
- Async Workers

## Phase 2 🚧

- Real AudD Integration
- Spotify Metadata
- Album Art
- Artist Information

## Phase 3

- Sound Effect Recognition
- Audio Classification

## Phase 4

- Object Detection
- Face Detection
- Scene Recognition

## Phase 5

- Font Detection
- Color Palette Detection
- LUT Recognition

## Phase 6

- React Dashboard
- Authentication
- Upload History

## Phase 7

- AWS S3
- CI/CD
- Production Deployment

---

# 📸 Screenshots

Coming Soon

---

# 👨‍💻 Author

**Your Name**

Built with ❤️ using TypeScript, Prisma, BullMQ, Redis and FFmpeg.
