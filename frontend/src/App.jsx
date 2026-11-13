
import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/api";

function App() {
    const [backendStatus, setBackendStatus] = useState("Checking...");

    useEffect(() => {
        checkBackendHealth()
            .then((data) => {
                setBackendStatus(data.status);
            })
            .catch(() => {
                setBackendStatus("Connection failed");
            });
    }, []);

    return (
        <div>
            <h1>CampusBite</h1>
            <h2>Backend Connection</h2>
            <p>Status: {backendStatus}</p>
        </div>
    );
}

export default App;