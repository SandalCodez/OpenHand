import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import "./SettingsBento.css";
import type { User } from "../../../assets/user";
import WeeklyLineChart from "../../../components/charts/WeeklyLineChart";

type Level = User["level"];
const levelBadge: Record<Level, string> = {
  beginner: "bg-success",
  intermediate: "bg-warning text-dark",
  advanced: "bg-danger",
};

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
    fileInputRef.current?.click();
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


  // 🔹 Loading / error states
  if (loading) {
    return (
      <div className="container px-3 px-md-4 py-3 py-md-4">
        <div className="card bg-custom-color-dark border border-white rounded-4 p-4 text-white">
          Loading profile…
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="container px-3 px-md-4 py-3 py-md-4">
        <div className="card bg-danger border border-white rounded-4 p-4 text-white">
          <h2 className="h5 mb-2">Unable to load profile</h2>
          <p className="mb-0 small">{error ?? "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-3 px-md-4 py-3 py-md-4">
      {/* Header / Cover */}
      <div className="card bg-custom-color-dark border border-white rounded-4 mb-3 overflow-hidden">
        {/* Top row: owner vs visitor */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-2 px-3">
          <div className="d-flex align-items-center gap-2">
            {isOwned ? (
              <span className="badge bg-success rounded-pill">
                Owner View
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                Visitor View
              </span>
            )}
          </div>

          <div className="text-white-50 small">
            {isOwned
              ? "Profile view is currently showing your own account."
              : "Profile view is currently showing this user's account."}
          </div>
        </div>

        {/* Cover bar */}
        <div
          style={{
            height: 140,
            background:
              "linear-gradient(90deg, rgba(0,214,255,.18), rgba(0,214,255,0) 60%), #121521",
          }}
        />

                {/* Main header content */}
        <div className="card-body d-flex align-items-start justify-content-between gap-4">
          {/* LEFT: avatar + name + stats */}
          <div className="d-flex align-items-center gap-3 flex-grow-1">
            <div
              className="rounded-circle overflow-hidden border border-white"
              style={{
                width: 84,
                height: 84,
                marginTop: -72,
                cursor: canEditProfile ? "pointer" : "default",
                opacity: avatarUploading ? 0.6 : 1,
                position: "relative",
              }}
              onClick={handleAvatarClick}
              title={canEditProfile ? "Click to change avatar" : undefined}
            >
              {currentUser.avatarSrc ? (
                <img
                  src={currentUser.avatarSrc}
                  alt={formatName(currentUser)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="bg-secondary w-100 h-100 d-flex align-items-center justify-content-center">
                  <span className="small text-white-50">
                    {avatarUploading ? "Uploading..." : "Add avatar"}
                  </span>
                </div>
              )}

              {avatarUploading && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ background: "rgba(0,0,0,0.5)", fontSize: 12 }}
                >
                  Uploading…
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="h4 text-white m-0">
                  {currentUser.nickname || currentUser.username}
                </h2>
                <span
                  className={`badge ${levelBadge[currentUser.level]} rounded-pill text-uppercase`}
                >
                  {currentUser.level}
                </span>
                {isOwned && (
                  <span className="badge bg-info text-dark rounded-pill">
                    This is your profile
                  </span>
                )}
              </div>

              <div className="text-white-50 small">
                @{currentUser.username || currentUser.username} • Joined{" "}
                {formatMonthYear(currentUser.joinDate)}
              </div>

              <div className="d-flex flex-wrap gap-3 mt-2 small">
                <div>
                  <div className="text-white-50">Lessons avg</div>
                  <div className="text-white fw-semibold">
                    {currentUser.lessonsAvgGrade ?? 0}%
                  </div>
                </div>
                <div>
                  <div className="text-white-50">Following</div>
                  <div className="text-white fw-semibold">
                    {currentUser.following ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-white-50">Followers</div>
                  <div className="text-white fw-semibold">
                    {currentUser.followers ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-white-50">Streak</div>
                  <div className="text-white fw-semibold">
                    🔥 {currentUser.dailyStreak ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Bio to the right of the name block */}
          {currentUser.bio && (
            <div
              className="text-white-50 small flex-shrink-0"
              style={{ maxWidth: "260px" }}
            >
              <div className="fw-semibold text-white mb-1">Bio</div>
              <div>{currentUser.bio}</div>
            </div>
          )}

                    {/* RIGHT: header buttons */}
          <div className="d-flex align-items-start gap-2">
            {canEditProfile && (
              <button
                className="btn btn-info rounded-3"
                onClick={() => {
                  setEditForm({
                    nickname: currentUser.nickname ?? "",
                    username: currentUser.username ?? currentUser.userName,
                    dob: currentUser.dob ?? "",
                    bio: currentUser.bio ?? "",
                  });
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </button>
            )}

            <div className="d-flex flex-column align-items-end gap-1">
              <button
                className="btn btn-outline-light rounded-3"
                title="Share profile"
                onClick={handleShare}
              >
                Share
              </button>

              {shareCopied && (
                <span className="badge bg-success text-white small rounded-pill">
                  Link copied ✔
                </span>
              )}
            </div>
          </div>


          {isEditing && (
            <div className="card bg-dark text-white p-4 mt-4 rounded-4 w-100">
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

              <div className="d-flex gap-2 mt-3">
                <button
  className="btn btn-success"
  onClick={async () => {
    const res = await fetch("http://localhost:8000/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    const json = await res.json();
    console.log("PATCH /api/users/me response:", json); // 🔧 debug

    if (res.ok) {
      setCurrentUser(json);       // should include bio now
      setIsEditing(false);
    } else {
      alert("Failed to update profile: " + (json.detail ?? "Unknown error"));
    }
  }}
>
  Save
</button>


                <button
                  className="btn btn-outline-light"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
           </div>          {/* closes card-body */}
      </div>            {/* closes the header .card */}


      {/* Weekly progress + summary */}
      <div className="bg-transparent text-white rounded-4 mb-3">
        <div className="card-body d-flex flex-column flex-xl-row justify-content-between align-items-start gap-4">
          {/* Left: Chart */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
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
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    {currentUser.avatarSrc && (
                      <img
                        src={currentUser.avatarSrc}
                        alt={currentUser.nickname || currentUser.username}
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
                        {currentUser.nickname || currentUser.username}{" "}
                        <span className="text-white-50">
                          @{currentUser.username || currentUser.username}
                        </span>
                      </div>
                      <div className="small text-white-50">
                        {thisWeekTotal} lessons this week
                      </div>
                      <div className="small text-white-50">
                        {lastWeekTotal} last week
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          {/* Right: Stats / controls */}
          <div
            className="border-start border-white ps-4"
            style={{ minWidth: "300px", flexShrink: 0 }}
          >
            <h3 className="h5 mb-3">Overview</h3>

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
                <div className="fw-semibold">
                  {(currentUser.xp ?? 0).toLocaleString()}
                </div>

                {isOwned && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info mt-2"
                    onClick={async () => {
                      setShowFriends((open) => {
                        const next = !open;
                        if (next) {
                          setFriendsTab("friends");
                          fetchMyFriends();
                        }
                        return next;
                      });
                    }}
                  >
                    Friends
                  </button>
                )}
              </div>

              <div>
                <div className="text-white-50 small">Avg grade</div>
                <div className="fw-semibold">
                  {currentUser.lessonsAvgGrade ?? 0}%
                </div>
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

            {/* Friends panel – owner only */}
            {isOwned && showFriends && (
              <div className="mt-3 p-3 rounded-3 border border-white-25 bg-transparent">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="text-white-50 small">Friends</div>
                  {friendsLoading && (
                    <span className="small text-white-50">Loading…</span>
                  )}
                </div>

                <div className="btn-group btn-group-sm mb-3" role="group">
                  <button
                    type="button"
                    className={`btn btn-outline-info ${
                      friendsTab === "friends" ? "active" : ""
                    }`}
                    onClick={() => {
                      setFriendsTab("friends");
                      fetchMyFriends();
                    }}
                  >
                    Friends
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-info ${
                      friendsTab === "find" ? "active" : ""
                    }`}
                    onClick={() => {
                      setFriendsTab("find");
                      fetchAllUsers();
                    }}
                  >
                    Find Friends
                  </button>
                </div>

                {friendsTab === "friends" ? (
                  <ul className="list-unstyled mb-0 small">
                    {friends.length === 0 && (
                      <li className="text-white-50">
                        You haven’t added any friends yet.
                      </li>
                    )}
                    {friends.map((u) => (
                      <li
                        key={u.id}
                        className="d-flex justify-content-between align-items-center mb-1"
                      >
                        <button
                          type="button"
                          className="btn btn-link p-0 text-info"
                          onClick={() => {
                            navigate(`/dashboard/profile/${u.id}`);
                          }}
                        >
                          @{u.username || u.userName}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => updateFriend(u.id, "remove")}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-unstyled mb-0 small">
                    {allUsers.length === 0 && (
                      <li className="text-white-50">No users found.</li>
                    )}
                    {allUsers.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      const isFriend = friends.some((f) => f.id === u.id);

                      return (
                        <li
                          key={u.id}
                          className="d-flex justify-content-between align-items-center mb-1"
                        >
                          <button
                            type="button"
                            className="btn btn-link p-0 text-info"
                            onClick={() => {
                              navigate(
                                isSelf
                                  ? "/dashboard/profile"
                                  : `/dashboard/profile/${u.id}`
                              );
                            }}
                          >
                            @{u.username || u.userName}
                            {isSelf && (
                              <span className="text-white-50"> (you)</span>
                            )}
                          </button>
                          {!isSelf &&
                            (isFriend ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={() => updateFriend(u.id, "remove")}
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-info"
                                onClick={() => updateFriend(u.id, "add")}
                              >
                                Add
                              </button>
                            ))}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
