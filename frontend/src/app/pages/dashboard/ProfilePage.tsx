// src/app/pages/dashboard/ProfilePage.tsx
import React, { useMemo, useState } from "react";
import "./SettingsBento.css";
import { usersData, type User, weekdayLabels } from "../../../assets/user";
import WeeklyLineChart from "../../../components/charts/WeeklyLineChart";

type Level = User["level"];
const levelBadge: Record<Level, string> = {
  beginner: "bg-success",
  intermediate: "bg-warning text-dark",
  advanced: "bg-danger",
};

const formatName = (u: User) => `${u.firstName} ${u.lastName}`;
const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long" });

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export default function ProfilePage() {
  const [currentId, setCurrentId] = useState(usersData[0]?.id ?? "");
  const [compareId, setCompareId] = useState<string>(""); // optional comparator

  const currentUser = useMemo(
    () => usersData.find((u) => u.id === currentId) ?? usersData[0],
    [currentId]
  );
  const compareUser = useMemo(
    () => usersData.find((u) => u.id === compareId),
    [compareId]
  );

  const thisWeekTotal = sum(currentUser.weeklyThis);
  const lastWeekTotal = sum(currentUser.weeklyLast);

  
  return (
    <div className="container px-3 px-md-4 py-3 py-md-4">
      {/* Header / Cover */}
      <div className="card bg-custom-color-dark border border-white rounded-4 mb-3 overflow-hidden">
            {/* Profile Selector */}
    <div className="d-flex justify-content-end mb-3 mt-2">
      <div className="d-flex align-items-center gap-2">
        <label htmlFor="profileSelect" className="text-white-50 small">
          View profile:
        </label>
        <select
          id="profileSelect"
          className="form-select bg-dark text-white border-white rounded-3"
          style={{ width: 220 }}
          value={currentId}
          onChange={(e) => setCurrentId(e.target.value)}
        >
          {usersData.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nickname} (@{u.username})
            </option>
          ))}
        </select>
      </div>
    </div>

        <div
          style={{
            height: 140,
            background:
              "linear-gradient(90deg, rgba(0,214,255,.18), rgba(0,214,255,0) 60%), #121521",
          }}
        />
        <div className="card-body d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle overflow-hidden border border-white"
              style={{ width: 84, height: 84, marginTop: -72 }}
            >
              {currentUser.avatarSrc ? (
                <img
                  src={currentUser.avatarSrc}
                  alt={formatName(currentUser)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="bg-secondary w-100 h-100" />
              )}
            </div>

            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="h4 text-white m-0">{currentUser.nickname}</h2>
                <span className={`badge ${levelBadge[currentUser.level]} rounded-pill text-uppercase`}>
                  {currentUser.level}
                </span>
              </div>
              <div className="text-white-50 small">
                @{currentUser.username} • Joined {formatMonthYear(currentUser.joinDate)}
              </div>

              <div className="d-flex flex-wrap gap-3 mt-2 small">
                <div>
                  <div className="text-white-50">Lessons avg</div>
                  <div className="text-white fw-semibold">{currentUser.lessonsAvgGrade}%</div>
                </div>
                <div>
                  <div className="text-white-50">Following</div>
                  <div className="text-white fw-semibold">{currentUser.following}</div>
                </div>
                <div>
                  <div className="text-white-50">Followers</div>
                  <div className="text-white fw-semibold">{currentUser.followers}</div>
                </div>
                <div>
                  <div className="text-white-50">Streak</div>
                  <div className="text-white fw-semibold">🔥 {currentUser.dailyStreak}</div>
                </div>
              </div>
            </div>
          </div>

         <div className="d-flex align-items-center gap-2">
  <button
    className="btn btn-outline-info rounded-3"
    onClick={() => alert('Add friend feature coming soon!')}
  >
    Add Friend
  </button>

  <button
    className="btn btn-outline-light rounded-3"
    title="Share profile"
    onClick={() => alert('Share profile feature coming soon!')}
  >
    Share
  </button>
</div>


        </div>
      </div>

      {/* Weekly progress + comparison */}
<div className="bg-transparent text-white rounded-4 mb-3">

  <div className="card-body d-flex flex-column flex-xl-row justify-content-between align-items-start gap-4">

    {/* Left: Chart */}
    <div className="flex-grow-1" style={{ minWidth: 0 }}>
      <WeeklyLineChart
        series={[
          {
            label: "",
            data: currentUser.weeklyThis,
            colorClass: "text-info",
            stroke: "var(--bs-info)",
          },
          compareUser
            ? {
                label: compareUser.nickname,
                data: compareUser.weeklyThis,
                colorClass: "text-primary",
                stroke: "rgba(173,132,255,.95)",
              }
            : {
                label: "",
                data: currentUser.weeklyLast,
                colorClass: "text-secondary",
                stroke: "rgba(255,255,255,.45)",
              },
        ]}
        rightSummary={
  <div className="d-flex align-items-center gap-3">
    {/* Current user */}
    <div className="d-flex align-items-center gap-2">
      {currentUser.avatarSrc && (
        <img
          src={currentUser.avatarSrc}
          alt={currentUser.nickname}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />
      )}
      <div>
        <div className="fw-semibold text-info">
          {currentUser.nickname} <span className="text-white-50">@{currentUser.username}</span>
        </div>
        <div className="small text-white-50">{thisWeekTotal} lessons this week</div>
      </div>
    </div>

    {/* Divider */}
    {compareUser && (
      <div
        style={{
          width: 1,
          height: 36,
          backgroundColor: "rgba(255,255,255,0.2)",
          marginInline: 12,
        }}
      />
    )}

    {/* Compare user */}
    {compareUser && (
      <div className="d-flex align-items-center gap-2">
        {compareUser.avatarSrc && (
          <img
            src={compareUser.avatarSrc}
            alt={compareUser.nickname}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        )}
        <div>
          <div className="fw-semibold" style={{ color: "rgba(173,132,255,.95)" }}>
            {compareUser.nickname}{" "}
            <span className="text-white-50">@{compareUser.username}</span>
          </div>
          <div className="small text-white-50">
            {sum(compareUser.weeklyThis)} lessons this week
          </div>
        </div>
      </div>
    )}
  </div>
}

      />
    </div>

    {/* Right: Compare controls */}
    <div
      className="border-start border-white ps-4"
      style={{ minWidth: "300px", flexShrink: 0 }}
    >
      <h3 className="h5 mb-3">Compare</h3>

      <label className="form-label text-white-50 small">Compare with</label>
      <select
        className="form-select bg-dark text-white border-white rounded-3 mb-3"
        value={compareId}
        onChange={(e) => setCompareId(e.target.value)}
      >
        <option value="">(show last week)</option>
        {usersData
          .filter((u) => u.id !== currentUser.id)
          .map((u) => (
            <option key={u.id} value={u.id}>
              {u.nickname} (@{u.username})
            </option>
          ))}
      </select>

      <div className="small text-white-50 mb-2">Days</div>
      <div className="d-flex gap-2 flex-wrap">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <span
            key={i}
            className="badge rounded-pill text-white-50 weekday-hover"
            style={{
              background: "rgba(255,255,255,.06)",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      <hr className="my-3 border-white-25" />

      <div className="d-flex justify-content-between">
        <div>
          <div className="text-white-50 small">XP</div>
          <div className="fw-semibold">{currentUser.xp.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-white-50 small">Avg grade</div>
          <div className="fw-semibold">{currentUser.lessonsAvgGrade}%</div>
        </div>
        <div>
          <div className="text-white-50 small">Level</div>
          <span
            className={`badge ${levelBadge[currentUser.level]} rounded-pill text-uppercase`}
          >
            {currentUser.level}
          </span>
        </div>
      </div>

      <div className="mt-3 d-grid gap-2">
        <button
          className="btn btn-outline-info rounded-3"
          onClick={() => alert("View friends feature coming soon!")}
        >
          View Friends
        </button>
      </div>
    </div>

  </div>
</div>

      </div>
    
  );
}
