import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartClass from "./StartClass";
import JoinClass from "./JoinClass";
import CreateMeetingDashboard from "./CreateMeetingDashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/class/start/:userId/:roomId" element={<StartClass />} />
                <Route exact path="/class/join/:userId/:roomId" element={<JoinClass />} />
                <Route exact path="/class/:userId/:roomId" element={<CreateMeetingDashboard />} />
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
