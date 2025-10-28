import React from "react";
import type { User } from "../../assets/user";

export type ProfileCardProps = {
  user: User;
  onViewProfile?: (userId: string) => void;
};

const levelBadge: Record<User["level"], string> = {
  beginner: "bg-success",
  intermediate: "bg-warning text-dark",
  advanced: "bg-danger",
};

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" });

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewProfile }) => {
  return (
    <div
      className="card bg-custom-color-dark border border-light rounded-4 shadow-sm h-100"
      style={{ cursor: onViewProfile ? "pointer" : "default" }}
      onClick={() => onViewProfile?.(user.id)}
    >
      <div className="card-body d-flex flex-column text-light text-center">
        <div className="d-flex justify-content-center mb-3">
          {user.avatarSrc ? (
            <img
              src={user.avatarSrc}
              alt={user.nickname}
              style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 100, height: 100, border: "1px dashed #4b5563" }}
            >
              <span className="text-secondary small">avatar</span>
            </div>
          )}
        </div>

        <h5 className="fw-semibold mb-0">{user.nickname}</h5>
        <div className="text-secondary small mb-2">@{user.username}</div>

        <div className="d-flex justify-content-center mb-3">
          <span className={`badge rounded-4 ${levelBadge[user.level]} text-uppercase`}>
            {user.level}
          </span>
        </div>

        <div className="small text-white-50">
          <div>Joined {formatMonthYear(user.joinDate)}</div>
          <div>Avg Grade: <strong className="text-info">{user.lessonsAvgGrade}%</strong></div>
          <div>
            XP: {user.xp.toLocaleString()} • Streak: 🔥 {user.dailyStreak}
          </div>
        </div>

        <hr className="my-3 border-white-25" />

        <div className="d-flex justify-content-center gap-4 small">
          <div>
            <div className="fw-semibold text-white">{user.following}</div>
            <div className="text-white-50">Following</div>
          </div>
          <div>
            <div className="fw-semibold text-white">{user.followers}</div>
            <div className="text-white-50">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
