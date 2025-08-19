import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartClass from "./StartClass";
import JoinClass from "./JoinClass";
import TeacherDashboard from "./TeacherDashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/class/start/:roomId" element={<StartClass />} />
                <Route exact path="/class/join/:roomId" element={<JoinClass />} />
                <Route exact path="/class/:secret" element={<TeacherDashboard />} />

                {/* Catch-all route for unmatched URLs */}
                <Route
                    path="*"
                    element={
                        <RedirectToExternal url="https://garbhsarthi.com/" />
                    }
                />
            </Routes>
        </Router>
    );
}

// Component to redirect to external URL
function RedirectToExternal({ url }) {
    window.location.href = url;
    return null;
}

export default App;
