import { Medal } from "lucide-react";
import "./UserTab.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserManager } from "../../../services/UserManager";
import type { User } from "../../../assets/user";

type UserTabProps = {
  user?: {
    first_name?: string;
    name?: string;
  };
};

/** Convert a name into initials like "NK" */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserTab({ user: initialUser }: UserTabProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const manager = UserManager.getInstance();

    // Subscribe to updates
    const unsubscribe = manager.subscribe((user, stats) => {
      setCurrentUser(user);
    });

    // Trigger fetch if no user data yet
    if (!manager.getCurrentUser()) {
      manager.fetchCurrentUser();
    }

    return () => unsubscribe();
  }, []);

  // Fallback logic: use UserManager data first, then props, then default
  const displayName = currentUser?.nickname || currentUser?.userName || initialUser?.first_name || initialUser?.name || "Guest K";
  const initials = getInitials(displayName);
  const avatarSrc = currentUser?.avatarSrc;

  return (
    <div className="user-tab text-secondary d-flex align-items-center my-2 mx-3 gap-3 ">
      {/* Avatar */}
      <div
        className="avatar-circle rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm overflow-hidden"
        style={{ width: "40px", height: "40px", cursor: "pointer" }}
        onClick={() => navigate("/dashboard/profile")}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-gradient-primary">
            <span>{initials}</span>
          </div>
        )}
      </div>

      {/* Name / Greeting */}
      <div className="d-flex flex-column justify-content-center">
        <span className="user-name fw-bold text-white" style={{ fontSize: "0.9rem" }}>
          {displayName}
        </span>
        <span className="user-role text-white-50" style={{ fontSize: "0.75rem" }}>
          Student
        </span>
      </div>

      <div className="flex-grow-1 " />

      <div className="user-level-pill">
        <button
          onClick={() => navigate("/dashboard/roadmap")}
          className="icon-pill btn btn-sm p-0 d-flex align-items-center text-secondary justify-content-center"
          aria-label="Badges / level"
        >
          <Medal size={26} />
        </button>
        <span className="user-level-tooltip">
          Level 3
        </span>
      </div>
    </div>
  );
}
