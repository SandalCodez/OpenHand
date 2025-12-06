import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Reuse profile styles for consistency

export default function SettingsPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{
    user: any;
    settings: { showCamera: boolean; handColor?: string };
    updateSettings: (s: any) => void
  }>();

  const { settings, updateSettings } = context || {};

  return (
    <div className="container-fluid bg-black min-vh-100 p-0">
      <div className="p-4 p-lg-5">
        <h1 className="h3 text-white fw-bold mb-4">Settings</h1>

        <div className="row g-4">

          {/* General Settings */}
          <div className="col-12 col-lg-6">
            <div className="profile-card p-4 h-100">
              <h2 className="h5 text-white mb-3 fw-bold">
                <i className="bi bi-sliders me-2 text-info"></i>
                General
              </h2>

              <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-white-10">
                <div>
                  <div className="text-white fw-semibold">Homepage Camera</div>
                  <div className="text-white-50 small">Show the hand recognition camera on the dashboard.</div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    style={{ transform: "scale(1.2)" }}
                    checked={settings?.showCamera ?? true}
                    onChange={(e) => updateSettings?.({ showCamera: e.target.checked })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-white-10">
                <div>
                  <div className="text-white fw-semibold">Hand Connector Color</div>
                  <div className="text-white-50 small">Customize the color of the hand tracking lines.</div>
                </div>
                <div>
                  <input
                    type="color"
                    className="form-control form-control-color bg-dark border-white"
                    value={settings?.handColor || "#45caff"}
                    onChange={(e) => updateSettings?.({ handColor: e.target.value })}
                    title="Choose your hand color"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="col-12 col-lg-6">
            <div className="profile-card p-4 h-100">
              <h2 className="h5 text-white mb-3 fw-bold">
                <i className="bi bi-person-gear me-2 text-warning"></i>
                Account
              </h2>

              <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-white-10">
                <div>
                  <div className="text-white fw-semibold">Edit Profile</div>
                  <div className="text-white-50 small">Update your name, bio, and avatar.</div>
                </div>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => navigate("/dashboard/profile")}
                >
                  Go to Profile
                </button>
              </div>

              <div className="mt-4">
                <button className="btn btn-danger w-100" onClick={() => navigate("/logout")}>
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* About / App Info */}
          <div className="col-12">
            <div className="profile-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="h5 text-white fw-bold">About OpenHand</h2>
                <a
                  href="https://github.com/SandalCodez/OpenHand"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white text-decoration-none fs-4"
                  title="View on GitHub"
                >
                  <i className="bi bi-github"></i>
                </a>
              </div>

              <div className="text-white-50 mb-4">
                <p>Version 0.1.0-alpha</p>
                <p>OpenHand is an open-source project designed to teach sign language using AI.</p>
              </div>

              <button
                className="btn btn-outline-info rounded-3"
                onClick={() => navigate("/dashboard/faq")}
              >
                <i className="bi bi-question-circle me-2"></i>
                Open FAQ
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
