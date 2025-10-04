import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {useHistory} from "react-router-dom";

const useBlockBackButton = () => {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const state = window.history.state;
        if (history.length > 1 && (!state || state.page !== location.pathname)) {
            window.history.pushState({ page: location.pathname }, "", location.pathname);
        }
    }, [location]); // Runs whenever the route changes
};

export default useBlockBackButton;
