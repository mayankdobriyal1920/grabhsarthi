import React from "react";
import { IonIcon } from "@ionic/react";
import {
    videocamOutline,
    libraryOutline,
    pulseOutline,
    peopleOutline,
} from "ionicons/icons";
import {useHistory} from "react-router-dom";

export default function PregnantTTCQuickActionsComponent() {
    const history = useHistory();
    const goToPage = (page)=>{
        history.push(page)
    }

    return (
        <div className="chips">
            <button className="chip">
                <IonIcon icon={videocamOutline} />
                <span>Live Classes</span>
            </button>
            <button className="chip">
                <IonIcon icon={libraryOutline} />
                <span>Video Library</span>
            </button>
            <button className="chip">
                <IonIcon icon={pulseOutline} />
                <span>Trackers</span>
            </button>
            <button className="chip">
                <IonIcon icon={peopleOutline} />
                <span>Community</span>
            </button>
        </div>
    );
}
