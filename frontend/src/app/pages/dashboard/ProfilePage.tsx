import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SettingsBento.css";
import "./ProfilePage.css";
// Removed placeholder imports if any were added
import type { User } from "../../../assets/user";
import { BADGES } from "../../../assets/badges";
import WeeklyLineChart from "../../../components/charts/WeeklyLineChart";




const formatName = (u: User) =>
  u.nickname || u.userName || u.username || "User";

const formatMonthYear = (iso: string | null | undefined) => {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
};

const sum = (arr: number[] | undefined | null) =>
  (arr ?? []).reduce((a, b) => a + b, 0);

export default function ProfilePage() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: "",
    username: "",
    dob: "",
    bio: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [showFriends, setShowFriends] = useState(false);
  const [friendsTab, setFriendsTab] = useState<"friends" | "find">("friends");
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);


  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 Owner vs visitor
  const [isOwned, setIsOwned] = useState<boolean>(true);

  useEffect(() => {
    const me = localStorage.getItem("currentUser");
    if (!uid || !me) {
      setIsOwned(true); // viewing your own profile
    } else {
      const parsed = JSON.parse(me);
      setIsOwned(uid === parsed.id); // visitor if not a match
    }
  }, [uid]);

  const canEditProfile = isOwned;


  // 🔹 Load profile (me or visitor)
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setCurrentUser(null); // clears stale profile
        setError(null);

        const endpoint = uid
          ? `http://localhost:8000/api/users/${uid}`
          : "http://localhost:8000/api/users/me";

        console.log("ProfilePage fetching:", endpoint);

        const res = await fetch(endpoint);

        if (!res.ok) {
          throw new Error(`Failed to load profile (${res.status})`);
        }

        const data = await res.json();
        if (!isMounted) return;

        setCurrentUser(data as User);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("loadProfile error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [uid]);

  const thisWeekTotal = useMemo(
    () => sum(currentUser?.weeklyThis),
    [currentUser]
  );
  const lastWeekTotal = useMemo(
    () => sum(currentUser?.weeklyLast),
    [currentUser]
  );

  const handleAvatarClick = () => {
    if (!canEditProfile) return;
    navigate("/avatar-selection");
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to upload avatar (${res.status})`);
      }

      const data = await res.json();

      setCurrentUser((prev) =>
        prev ? { ...prev, avatarSrc: data.avatarSrc ?? prev.avatarSrc } : prev
      );
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const fetchMyFriends = async () => {
    console.log("Calling fetchMyFriends()");
    try {
      setFriendsLoading(true);
      const res = await fetch("http://localhost:8000/api/users/me/friends");
      console.log("Friends fetch response:", res);
      if (!res.ok) {
        throw new Error(`Failed to load friends (${res.status})`);
      }
      const data = await res.json();
      console.log("Friends data received:", data);
      setFriends(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load friends.");
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    if (friendsTab === "friends") {
      fetchMyFriends();
    }
  }, [friendsTab]);


  const fetchAllUsers = async () => {
    try {
      setFriendsLoading(true);
      const res = await fetch("http://localhost:8000/api/users");
      if (!res.ok) {
        throw new Error(`Failed to load users (${res.status})`);
      }
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users.");
    } finally {
      setFriendsLoading(false);
    }
  };

  const updateFriend = async (friendUid: string, action: "add" | "remove") => {
    try {
      const res = await fetch("http://localhost:8000/api/users/me/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUid, action }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update friends (${res.status})`);
      }

      const data = await res.json();
      setFriends(data.friends ?? []);
    } catch (err) {
      console.error(err);
      alert("Failed to update friends.");
    }
  };

  // Share profile link (copies current URL with subtle feedback)
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setShareCopied(true);
          // hide pill after 2 seconds
          setTimeout(() => setShareCopied(false), 2000);
        })
        .catch(() => {
          window.prompt("Copy this profile link:", url);
        });
    } else {
      window.prompt("Copy this profile link:", url);
    }
  };


  if (loading) {
    return (
      <div className="container-fluid bg-black min-vh-100 p-4">
        <div className="text-white">Loading profile…</div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="container-fluid bg-black min-vh-100 p-4">
        <div className="alert alert-danger">
          <h2 className="h5 mb-2">Unable to load profile</h2>
          <p className="mb-0 small">{error ?? "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-black min-vh-100 p-0">
      <div className="p-4 p-lg-5">
        <div className="profile-container">

          {/* LEFT SIDEBAR */}
          <aside className="profile-sidebar">
            <div className="profile-card p-4 text-center">
              <div className="avatar-container mb-3"
                onClick={handleAvatarClick}
                style={{ cursor: canEditProfile ? "pointer" : "default" }}
                title={canEditProfile ? "Click to change" : ""}>
                <img
                  src={currentUser.avatarSrc || "https://via.placeholder.com/150"}
                  alt={formatName(currentUser)}
                  className="avatar-image"
                />
                {avatarUploading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <small className="text-white">Uploading...</small>
                  </div>
                )}

              </div>

              <h1 className="h3 text-white fw-bold mb-1">{currentUser.nickname || currentUser.username}</h1>

              <div className="mb-3">
                <div
                  className="top-mentor-badge"
                  onClick={() => canEditProfile && navigate("/title-selection")}
                  style={{
                    cursor: canEditProfile ? "pointer" : "default",
                    color: currentUser.titleColor || "inherit",
                    borderColor: currentUser.titleColor || "rgba(255,255,255,0.2)",
                    background: currentUser.titleColor ? `rgba(0,0,0,0.3)` : undefined
                  }}
                  title={canEditProfile ? "Click to change title" : ""}
                >
                  <span>👑</span> <span style={{ textShadow: currentUser.titleColor ? `0 0 10px ${currentUser.titleColor}` : "none" }}>{currentUser.title || "No Title Selected"}</span>
                </div>
              </div>

              <div className="text-white-50 small mb-4 text-start">
                {currentUser.bio || "No bio yet."}
              </div>

              <div className="action-buttons mb-3">
                {!isOwned && (
                  <button className="btn-profile-action" onClick={() => updateFriend(currentUser.id, "add")}>
                    <i className="bi bi-person-plus-fill me-1"></i> Follow
                  </button>
                )}
                <button className="btn-profile-action" onClick={handleShare}>
                  <i className="bi bi-share-fill me-1"></i> Share
                  {shareCopied && <span className="ms-1 small text-success">Copied!</span>}
                </button>
              </div>

              {canEditProfile && (
                <button
                  className="btn btn-outline-secondary w-100 mt-2 rounded-3"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Sidebar Stats / Info */}
            <div className="profile-card p-4">
              <div className="info-list">
                <div className="info-item">
                  <span className="d-flex align-items-center gap-2"><i className="bi bi-calendar-check"></i> Joined</span>
                  <span className="info-value">{formatMonthYear(currentUser.joinDate)}</span>
                </div>
                <div className="info-item">
                  <span className="d-flex align-items-center gap-2"><i className="bi bi-translate"></i> Language</span>
                  <span className="info-value">English</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main>
            {/* Tabs */}
            <nav className="profile-nav">
              {["Overview", "Friends"].map(tab => (
                <button
                  key={tab}
                  className={`nav-item-custom ${((tab === "Overview" && friendsTab !== "friends" && friendsTab !== "find") || (tab === "Friends" && (friendsTab === "friends" || friendsTab === "find"))) ? "active" : ""}`}
                  onClick={() => {
                    if (tab === "Friends") {
                      setFriendsTab("friends");
                      fetchMyFriends();
                      setShowFriends(true);
                    } else {
                      setShowFriends(false);
                      setFriendsTab("friends"); // reset default
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {!showFriends ? (
              /* Overview Tab Content */
              <div className="d-flex flex-column gap-4">

                {/* Stats Grid */}
                {/* Stats Grid */}
                <div className="d-flex gap-3 flex-wrap">
                  <div className="stat-card flex-grow-1">
                    <div className="stat-label">Level</div>
                    <div className="stat-number text-info">{currentUser.level}</div>
                  </div>
                  <div className="stat-card flex-grow-1">
                    <div className="stat-label">XP</div>
                    <div className="stat-number text-warning">{currentUser.xp?.toLocaleString() ?? 0}</div>
                  </div>
                  <div className="stat-card flex-grow-1">
                    <div className="stat-label">Streak</div>
                    <div className="stat-number text-danger">🔥 {currentUser.dailyStreak ?? 0}</div>
                  </div>
                  <div className="stat-card flex-grow-1">
                    <div className="stat-label">Friends</div>
                    <div className="stat-number text-success">{currentUser.friendCount ?? 0}</div>
                  </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="profile-card p-4">
                  <h3 className="h5 text-white mb-3 fw-bold">Weekly Activity</h3>
                  <WeeklyLineChart
                    series={[
                      {
                        label: "This week",
                        data: currentUser.weeklyThis ?? [0, 0, 0, 0, 0, 0, 0],
                        colorClass: "text-info",
                        stroke: "var(--bs-info)",
                      },
                      {
                        label: "Last week",
                        data: currentUser.weeklyLast ?? [0, 0, 0, 0, 0, 0, 0],
                        colorClass: "text-secondary",
                        stroke: "rgba(255,255,255,.45)",
                      },
                    ]}
                    rightSummary={
                      <div className="d-flex align-items-center gap-2">
                        <div>
                          <div className="small text-white-50">
                            {thisWeekTotal} lessons this week
                          </div>
                          <div className="small text-white-50">
                            {lastWeekTotal} last week
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>

                {/* Badges Section */}
                <div className="profile-card p-4">
                  <h3 className="h5 text-white mb-3 fw-bold">Badges</h3>
                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    {BADGES.map((badge, i) => {
                      const isUnlocked = (currentUser.xp ?? 0) >= badge.xp;

                      return (
                        <div
                          key={badge.id}
                          className="rounded-circle d-flex align-items-center justify-content-center transition-transform hover-scale overflow-hidden position-relative"
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: isUnlocked ? '#0dcaf0' : 'rgba(255,255,255,0.05)',
                            border: isUnlocked ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                            color: isUnlocked ? '#000' : 'rgba(255,255,255,0.2)',
                            cursor: 'help'
                          }}
                          title={isUnlocked ? `UNLOCKED: ${badge.title}` : `LOCKED: Need ${badge.xp} XP`}
                        >
                          {isUnlocked && badge.imageUrl ? (
                            <img src={badge.imageUrl} alt={badge.title} className="w-100 h-100 object-fit-cover" />
                          ) : isUnlocked ? (
                            <span className="h4 mb-0">🏅</span>
                          ) : (
                            <i className="bi bi-lock-fill small"></i>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Friends Tab Content */
              <div className="profile-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="h5 text-white mb-0 fw-bold">Friends</h3>
                  {friendsLoading && (
                    <span className="small text-white-50">Loading…</span>
                  )}
                </div>

                <div className="btn-group btn-group-sm mb-4">
                  <button
                    type="button"
                    className={`btn ${friendsTab === "friends" ? "btn-info" : "btn-outline-secondary text-white"}`}
                    onClick={() => {
                      setFriendsTab("friends");
                      fetchMyFriends();
                    }}
                  >
                    My Friends
                  </button>
                  <button
                    type="button"
                    className={`btn ${friendsTab === "find" ? "btn-info" : "btn-outline-secondary text-white"}`}
                    onClick={() => {
                      setFriendsTab("find");
                      fetchAllUsers();
                    }}
                  >
                    Find Friends
                  </button>
                </div>

                {friendsTab === "friends" ? (
                  <div className="d-flex flex-column gap-2 friends-scroll-container">
                    {friends.length === 0 && (
                      <div className="text-white-50 fst-italic">
                        You haven’t added any friends yet.
                      </div>
                    )}
                    {friends.map((u) => (
                      <div key={u.id} className="d-flex justify-content-between align-items-center p-3 bg-white bg-opacity-10 rounded-3">
                        <div className="d-flex align-items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/dashboard/profile/${u.id}`)}>
                          <img src={u.avatarSrc || "https://via.placeholder.com/40"}
                            alt={u.username}
                            className="rounded-circle"
                            style={{ width: 40, height: 40, objectFit: "cover" }} />
                          <div>
                            <div className="text-white fw-semibold">@{u.username || u.userName}</div>
                            <div className="small text-white-50">{u.level}</div>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => updateFriend(u.id, "remove")}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 friends-scroll-container">
                    {allUsers.length === 0 && (
                      <div className="text-white-50">No users found.</div>
                    )}
                    {allUsers.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      const isFriend = friends.some((f) => f.id === u.id);

                      return (
                        <div key={u.id} className="d-flex justify-content-between align-items-center p-3 bg-white bg-opacity-10 rounded-3">
                          <div className="d-flex align-items-center gap-3 cursor-pointer"
                            onClick={() => navigate(isSelf ? "/dashboard/profile" : `/dashboard/profile/${u.id}`)}>
                            <img src={u.avatarSrc || "https://via.placeholder.com/40"}
                              alt={u.username}
                              className="rounded-circle"
                              style={{ width: 40, height: 40, objectFit: "cover" }} />
                            <div>
                              <div className="text-white fw-semibold">
                                @{u.username || u.userName}
                                {isSelf && <span className="text-white-50 small"> (you)</span>}
                              </div>
                            </div>
                          </div>

                          {!isSelf && (
                            isFriend ? (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => updateFriend(u.id, "remove")}>
                                Remove
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-info" onClick={() => updateFriend(u.id, "add")}>
                                Add Member
                              </button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {isEditing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
          <div className="card bg-dark text-white p-4 rounded-4 w-100" style={{ maxWidth: 500 }}>
            <h3 className="h5 mb-3">Edit Profile</h3>

            <div className="mb-3">
              <label className="form-label text-white-50">Nickname</label>
              <input
                className="form-control bg-dark text-white border-white"
                value={editForm.nickname}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, nickname: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white-50">Username</label>
              <input
                className="form-control bg-dark text-white border-white"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white-50">DOB</label>
              <input
                type="date"
                className="form-control bg-dark text-white border-white"
                value={editForm.dob}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dob: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white-50">Bio</label>
              <textarea
                className="form-control bg-dark text-white border-white"
                rows={3}
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, bio: e.target.value }))
                }
                placeholder="Tell others a bit about you..."
              />
            </div>

            <div className="d-flex gap-2 mt-3 justify-content-end">
              <button
                className="btn btn-outline-light"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={async () => {
                  const res = await fetch("http://localhost:8000/api/users/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm),
                  });

                  const json = await res.json();

                  if (res.ok) {
                    setCurrentUser(json);       // should include bio now
                    setIsEditing(false);
                  } else {
                    alert("Failed to update profile: " + (json.detail ?? "Unknown error"));
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
