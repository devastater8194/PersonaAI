/**
 * API Client — all calls to the FastAPI backend go through here.
 * Base URL set via NEXT_PUBLIC_API_URL in .env.local
 */

import axios from "axios";

// 🔧 Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Simple user ID — replace with real auth session later
const getUserId = () =>
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "user_demo_001";

// ─── IDENTITY ─────────────────────────────────────────────────

export async function saveIdentity(data: Record<string, any>) {
  const res = await api.post("/api/identity/save", {
    user_id: getUserId(),
    ...data,
  });
  return res.data;
}

export async function getIdentity() {
  const res = await api.get(`/api/identity/${getUserId()}`);
  return res.data;
}

// ─── GENERATE ─────────────────────────────────────────────────

export async function generateContent(payload: {
  topic: string;
  platform: string;
  content_type: string;
}) {
  const res = await api.post("/api/generate/", {
    user_id: getUserId(),
    ...payload,
  });
  return res.data; // array of { platform, content, carousel_slides, draft_id }
}

export async function getDrafts(status?: string) {
  const params = status ? { status } : {};
  const res = await api.get(`/api/generate/drafts/${getUserId()}`, { params });
  return res.data;
}

export async function approveDraft(draftId: string) {
  const res = await api.patch(`/api/generate/approve/${draftId}`);
  return res.data;
}

export async function deleteDraft(draftId: string) {
  const res = await api.delete(`/api/generate/draft/${draftId}`);
  return res.data;
}

// ─── TRENDS ──────────────────────────────────────────────────

export async function fetchTrends() {
  const res = await api.get(`/api/trends/${getUserId()}`);
  return res.data; // { trends: [], count: N }
}

// ─── SCHEDULE ─────────────────────────────────────────────────

export async function queuePost(payload: {
  draft_id: string;
  scheduled_for: string;
  email?: string;
}) {
  const res = await api.post("/api/schedule/queue", {
    user_id: getUserId(),
    ...payload,
  });
  return res.data;
}

export async function createWeekPlan(approvedDraftIds: string[]) {
  const res = await api.post("/api/schedule/week-plan", {
    user_id: getUserId(),
    approved_draft_ids: approvedDraftIds,
  });
  return res.data;
}

export async function getUpcoming() {
  const res = await api.get(`/api/schedule/upcoming/${getUserId()}`);
  return res.data;
}

export async function publishInstagram(draftId: string) {
  const res = await api.post(`/api/schedule/publish-instagram/${draftId}`);
  return res.data;
}
