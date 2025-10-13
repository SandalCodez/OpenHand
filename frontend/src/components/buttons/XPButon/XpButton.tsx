import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Crown, Users } from "lucide-react";
import "./XpButton.css";

type XPStatusProps = {
  level?: number;
  xp?: number;
  nextXp?: number;
};

type TabKey = "leaderboard" | "friends";

const sampleLeaderboard = [
  { id: 1, name: "You", xp: 1200, rank: 3 },
  { id: 2, name: "Ava", xp: 2100, rank: 1 },
  { id: 3, name: "Jason", xp: 1800, rank: 2 },
  { id: 4, name: "Esteban", xp: 950, rank: 4 },
  { id: 5, name: "Noah", xp: 720, rank: 5 },
    { id: 6, name: "Josh", xp: 719, rank: 7 },
  { id: 7, name: "Kevin", xp: 950, rank: 8 },
  { id: 8, name: "Justin", xp: 718, rank: 6 },
];

const sampleFriends = [
  { id: "f1", name: "Ava", status: "Online" },
  { id: "f2", name: "Kai", status: "Busy" },
  { id: "f3", name: "Mila", status: "Offline" },
  { id: "f4", name: "Noah", status: "Online" },
  { id: "f5", name: "Eli", status: "Offline" },
    { id: "f6", name: "Josh", status: "Offline" },
  { id: "f7", name: "Justin", status: "Online" },
  { id: "f8", name: "Esteban", status: "Offline" },
   { id: "f9", name: "Jason", status: "Offline" },
  
];

const XpButton: React.FC<XPStatusProps> = ({ level = 3, xp = 1200, nextXp = 2000 }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("leaderboard");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pct = Math.max(0, Math.min(100, Math.round((xp / nextXp) * 100)));

  // focus + Esc
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <div className="xp-btn-wrap">
        <button
          type="button"
          className="btn btn-dark border-light d-flex align-items-center gap-2 rounded-pill shadow-sm"
          onClick={() => setOpen(true)}
          aria-controls="xpDrawer"
          aria-expanded={open}
        >
          <Award size={25} aria-hidden="true" />
          <span>XP</span>
        </button>
      </div>

      {/* Backdrop */}
      <div className={`xp-overlay ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div
        id="xpDrawer"
        ref={panelRef}
        className={`xp-drawer rounded-5 p-2 ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="xpTitle"
      >
        <div className="xp-header d-flex justify-content-between align-items-center">
          <h5 id="xpTitle" className="m-0">Your Progress</h5>
          <button className="btn-close btn-close-white" onClick={() => setOpen(false)} aria-label="Close" />
        </div>

        {/* Top summary area */}
        <div className="xp-body">
          <img
            src="../mascot-smiling.png"
            className="hover-mascot mx-auto "
            style={{ maxWidth: "200px", height: "200px" }}
            alt="Mascot Smiling"
          />
          <div className="d-flex align-items-center gap-2 mb-2">
            <Award size={18} />
            <strong>Level {level}</strong>
          </div>
          <div className="small text-secondary mb-2">
            {xp} / {nextXp} XP
          </div>

          <div className="progress mb-3" style={{ height: 8 }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${pct}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            />
          </div>

          <Link to="/dashboard/roadmap" className="btn btn-outline-light w-100 rounded-pill mb-1">
            Open Roadmap
          </Link>
          <hr></hr>
          {/* Tabs */}
          <div className="xp-tabs btn-group w-100 mb-2" role="tablist" aria-label="XP tabs">
            <button
              type="button"
              className={`btn btn-sm ${tab === "leaderboard" ? "btn-light" : "btn-outline-light"}`}
              onClick={() => setTab("leaderboard")}
              aria-pressed={tab === "leaderboard"}
            >
              <Crown size={16} className="me-1" /> Leaderboard
            </button>
            <button
              type="button"
              className={`btn btn-sm ${tab === "friends" ? "btn-light" : "btn-outline-light"}`}
              onClick={() => setTab("friends")}
              aria-pressed={tab === "friends"}
            >
              <Users size={16} className="me-1" /> Friends
            </button>
          </div>
        </div>
        {/* Scrollable lists */}
        <div className="xp-body-scrollable">
          <div className="xp-content">
            {tab === "leaderboard" ? (
              <ul className="list-unstyled m-0">
                {sampleLeaderboard
                  .sort((a, b) => a.rank - b.rank)
                  .map((p) => (
                    <li key={p.id} className="xp-row">
                      <span className="xp-rank">{p.rank}</span>
                      <div className="xp-avatar">{p.name[0]}</div>
                      <div className="xp-name">{p.name}</div>
                      <div className="ms-auto xp-xp">{p.xp} XP</div>
                    </li>
                  ))}
              </ul>
            ) : (
              <ul className="list-unstyled m-0">
                {sampleFriends.map((f) => (
                  <li key={f.id} className="xp-row">
                    <div className="xp-avatar">{f.name[0]}</div>
                    <div className="xp-name">
                      {f.name}
                      <div className="small text-secondary">{f.status}</div>
                    </div>
                    <button className="btn btn-sm btn-outline-light rounded-pill ms-auto">
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default XpButton;
