import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsBento.css";
import { SettingsManager, type UserSettings } from "../../../services/SettingsManager";
import { UserManager } from "../../../services/UserManager";
import { Github, HelpCircle, Settings as SettingsIcon, Camera, LogOut } from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>(SettingsManager.getInstance().getSettings());
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = SettingsManager.getInstance().subscribe(setSettings);
        return unsub;
    }, []);

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        SettingsManager.getInstance().updateSettings({ [key]: value });
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            UserManager.getInstance().logout();
            navigate("/login");
        }
    };

    return (
        <div className="container px-3 px-md-4 py-3 py-md-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">

                    {/* Header */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="p-2 rounded-circle bg-custom-color-dark border border-secondary">
                            <SettingsIcon size={24} className="text-white" />
                        </div>
                        <h1 className="h2 text-white mb-0">Settings</h1>
                    </div>

                    {/* General Settings Section */}
                    <div className="mb-5">
                        <h2 className="h4 text-white-50 mb-3 text-uppercase fs-6 ls-1">General</h2>

                        {/* Home Page Camera */}
                        <div className="card bg-custom-color-dark border border-secondary rounded-4 mb-3">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded-circle bg-dark border border-secondary">
                                        <Camera size={24} className="text-info" />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 text-white">Home Page Camera</h5>
                                        <p className="mb-0 text-white-50 small">Show the hand tracking camera on the dashboard.</p>
                                    </div>
                                </div>
                                <div className="form-check form-switch fs-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={settings.showHomePageCamera}
                                        onChange={(e) => updateSetting("showHomePageCamera", e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hand Color */}
                        <div className="card bg-custom-color-dark border border-secondary rounded-4 mb-3">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded-circle bg-dark border border-secondary">
                                        <div
                                            style={{ width: 24, height: 24, backgroundColor: settings.handColor, borderRadius: '50%' }}
                                        />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 text-white">Hand Color</h5>
                                        <p className="mb-0 text-white-50 small">Customize the color of the hand landmarks.</p>
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="color"
                                        className="form-control form-control-color bg-transparent border-0"
                                        title="Choose your color"
                                        value={settings.handColor}
                                        onChange={(e) => updateSetting("handColor", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-5">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <HelpCircle size={18} className="text-white-50" />
                            <h2 className="h4 text-white-50 mb-0 text-uppercase fs-6 ls-1">Frequently Asked Questions</h2>
                        </div>

                        <div className="accordion" id="faqAccordion">
                            {[
                                { q: "Do we store any user data?", a: "NO. Your privacy is our top priority. We do not store any camera or biometric data." },
                                { q: "How do I start a lesson?", a: "Go to 'All Classes', select a category (Alphabet/Gestures), and verify your hand sign with the camera." },
                                { q: "Why isn't my camera working?", a: "Ensure you've granted browser permissions and that no other app is using the camera. Check the 'Home Page Camera' setting." },
                                { q: "How is my progress saved?", a: "Your progress is saved automatically to your profile when you complete a lesson." },
                                { q: "Can I customize my avatar?", a: "Yes! Go to your Profile page and click the Edit button to design your avatar." },
                            ].map((item, i) => (
                                <div className="accordion-item bg-custom-color-dark border border-secondary rounded-3 mb-2 overflow-hidden" key={i}>
                                    <h2 className="accordion-header">
                                        <button
                                            className="accordion-button collapsed bg-custom-color-dark text-white shadow-none"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#faq${i}`}
                                        >
                                            {item.q}
                                        </button>
                                    </h2>
                                    <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body text-white-50 border-top border-secondary">
                                            {item.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links & Actions Section */}
                    <div>
                        <h2 className="h4 text-white-50 mb-3 text-uppercase fs-6 ls-1">Links & Actions</h2>
                        <div className="d-grid gap-3 d-md-flex">
                            <a
                                href="https://github.com/SandalCodez/OpenHand"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-dark border border-secondary px-4 py-3 rounded-4 d-flex align-items-center gap-3 text-white flex-grow-1 justify-content-center justify-content-md-start"
                            >
                                <Github size={24} />
                                <div>
                                    <div className="fw-bold">GitHub Repository</div>
                                    <div className="small text-white-50">View source code</div>
                                </div>
                            </a>

                            <button
                                className="btn btn-danger px-4 py-3 rounded-4 d-flex align-items-center gap-3 text-white flex-grow-1 justify-content-center justify-content-md-start"
                                onClick={handleLogout}
                            >
                                <LogOut size={24} />
                                <div>
                                    <div className="fw-bold">Log Out</div>
                                    <div className="small opacity-75">Sign out of your account</div>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
