import { Bell, Info, Medal } from "lucide-react";
import "./UserTab.css";
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

export default function UserTab({ user }: UserTabProps) {
  const displayName = user?.first_name || user?.name || "Guest K";
  const initials = getInitials(displayName);

  return (
    <div className="user-tab text-secondary d-flex align-items-center my-2 mx-3 gap-3 ">
      {/* Avatar */}
      <div className="user-avatar d-flex align-items-center justify-content-center">
        <img
          src="https://i.pravatar.cc/150?img=1"
          alt="Profile"
          className="user-avatar-img"
        />
      </div>

      {/* Name + role */}
      <div className="d-flex flex-column">
        <span className="user-name small fw-semibold">{displayName}</span>
        <span className="user-status tiny ">Beginner</span>
      </div>

      {/* Spacer so icons push to right */}
      <div className="flex-grow-1 " />

      {/* Icons */}
      
      <div className="user-level-pill">
        <button
          className="icon-pill btn btn-sm p-0 d-flex align-items-center text-secondary justify-content-center"
          aria-label="Badges / level"
        >
          <Medal size={26} />
        </button>

        <span className="user-level-tooltip">
          Level 3
        </span>
      </div>

      <button
        className="icon-pill btn btn-sm p-0 d-flex align-items-center text-secondary justify-content-center"
        aria-label="Info"
      >
        <Info size={26} />
      </button>

      <button
        className="icon-pill btn btn-sm p-0 d-flex align-items-center  text-secondary justify-content-center"
        aria-label="Notifications"
      >
        <Bell size={26} />
      </button>


    </div>
  );
}
