import React, { useState } from "react";
import "./SettingsBento.css";

export default function SettingsPage() {
  // demo state (swap with your store/api)
  const [profile, setProfile] = useState({
    name: "first name",
    username: "last name",
    email: "user@gmail.com",
    curPwd: "",
    newPwd: "",
  });

  const [prefs, setPrefs] = useState({
    fingerOutlines: true,
    matchPercent: true,
    otherLesson: true,
    appearance: "dark",
  });

  const [notify, setNotify] = useState({
    weekly: { popup: false, email: false },
    internship: { popup: true, email: true },
    daily: { popup: false, email: true },
    friend: { popup: true, email: true },
    product: { popup: true, email: true },
  });

  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    publicProfile: true,
  });

  const onProfile = (k: keyof typeof profile, v: string) =>
    setProfile(p => ({ ...p, [k]: v }));

  const toggleNotify = (group: keyof typeof notify, key: "popup" | "email") =>
    setNotify(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key] },
    }));

  return (
    <div className="container px-3 px-md-4 py-3 py-md-4">
      <div className="row g-3">
        {/* Profile */}
        <div className="col-12 col-xl-6">
          <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
            <div className="card-body ">
              <h2 className="card-title h4 text-white mb-3">Profile</h2>

              <div className="mb-2">
                <label className="form-label text-white-50">Name</label>
                <input
                  className="form-control bg-transparent text-white border-secondary rounded-3"
                  value={profile.name}
                  onChange={(e) => onProfile("name", e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="form-label text-white-50">Username</label>
                <input
                  className="form-control bg-transparent text-white border-secondary rounded-3"
                  value={profile.username}
                  onChange={(e) => onProfile("username", e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="form-label text-white-50">Email</label>
                <input
                  type="email"
                  className="form-control bg-transparent text-white border-secondary rounded-3"
                  value={profile.email}
                  onChange={(e) => onProfile("email", e.target.value)}
                />
              </div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <label className="form-label text-white-50">Current Password</label>
                  <input
                    type="password"
                    className="form-control bg-transparent text-white border-secondary rounded-3"
                    value={profile.curPwd}
                    onChange={(e) => onProfile("curPwd", e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-white-50">New Password</label>
                  <input
                    type="password"
                    className="form-control bg-transparent text-white border-secondary  rounded-3"
                    value={profile.newPwd}
                    onChange={(e) => onProfile("newPwd", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-12 col-xl-6">
          <div className="card bg-transparent text-white border border-white rounded-4 h-100">
            <div className="card-body">
              <h2 className="card-title h4 text-white mb-3">Notifications</h2>

              {[
                ["Weekly Progress", "weekly"],
                
                ["Daily practice reminder", "daily"],
                ["Friend Activity", "friend"],
                ["Product Updates", "product"],
              ].map(([label, key]) => (
                <div className="d-flex align-items-center justify-content-between py-2 border-top border-white-25" key={key}>
                  <div className="me-3">{label}</div>
                  <div className="d-flex gap-3">
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={(notify as any)[key].popup}
                        onChange={() => toggleNotify(key as any, "popup")}
                      />
                      <label className="form-check-label text-white-50">Pop-up</label>
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={(notify as any)[key].email}
                        onChange={() => toggleNotify(key as any, "email")}
                      />
                      <label className="form-check-label text-white-50">Email</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card bg-transparent text-white border border-white rounded-4 h-100">
            <div className="card-body">
              <h2 className="card-title h4 text-white mb-3">Privacy</h2>

              <div className="d-flex justify-content-between align-items-start py-2">
                <div className="me-3">
                  <div className="fw-semibold">Camera</div>
                  <small className="text-white-50">
                    keep camera data and usage statistics open.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={privacy.dataCollection}
                    onChange={() => setPrivacy(p => ({ ...p, dataCollection: !p.dataCollection }))}
                  />
                </div>
              </div>

              <hr className="my-2 border-white-25" />

              <div className="d-flex justify-content-between align-items-start py-2">
                <div className="me-3">
                  <div className="fw-semibold">Public Profile</div>
                  <small className="text-white-50">
                    Allow others to find you and view progress.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={privacy.publicProfile}
                    onChange={() => setPrivacy(p => ({ ...p, publicProfile: !p.publicProfile }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card bg-transparent  text-white border border-white rounded-4 h-100">
            <div className="card-body">
              <h2 className="card-title h4 text-white mb-3">Preferences</h2>

              {[
                ["Finger Outlines", "fingerOutlines"],
                ["Match percent", "matchPercent"],
                ["Other lesson feature", "otherLesson"],
              ].map(([label, key]) => (
                <div className="d-flex justify-content-between align-items-center py-2" key={key}>
                  <span>{label}</span>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={(prefs as any)[key]}
                      onChange={() => setPrefs(p => ({ ...p, [key]: !(p as any)[key] }))}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-2">
                <label className="form-label text-white-50">Appearance</label>
                <select
                  className="form-select bg-dark text-white border-white rounded-3"
                  value={prefs.appearance}
                  onChange={(e) => setPrefs(p => ({ ...p, appearance: e.target.value }))}
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="col-12 col-xl-4">
          <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
            <div className="card-body">
              <h2 className="card-title h4 text-white mb-3">Support</h2>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary rounded-3">Open FAQ</button>
                <button className="btn btn-outline-success rounded-3">Contact Support</button>
                <button className="btn btn-outline-danger rounded-3">Report a Bug</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
