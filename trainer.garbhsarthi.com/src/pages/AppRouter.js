import { Routes, Route, Navigate } from 'react-router-dom';
import TrainerDashboard from "./TrainerDashboard";
import TrainerLogin from "./TrainerLogin";
import appLogo from "../theme/img/app-small-logo.png";

export default function AppRouter({ userSession, userInfo }) {
    if (userSession?.loading) {
        return (
            <main className="py-4">
                <div className="splash_loading_screen">
                    <div className="splash_loading_screen_inner">
                        <img alt="logo" src={appLogo} />
                    </div>
                </div>
            </main>
        );
    }

    const isAuthed = Boolean(userInfo?.id);

    return (
        <main className="py-4">
            {(!isAuthed) ?
                <Routes>
                    <Route path="/login" element={<TrainerLogin />}/>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                :
                <Routes>
                    {/* Gate /home to show Dashboard if logged in, TrainerLogin otherwise */}
                    <Route path="/home" element={<TrainerDashboard />}/>
                    <Route path="/home/:result" element={<TrainerDashboard />}/>
                    {/* Catch-all -> /home */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            }
        </main>
    );
}
