import React from "react";
import { IonIcon } from "@ionic/react";
import {
    videocamOutline,
    pulseOutline,
    peopleOutline,
    settingsOutline,
} from "ionicons/icons";
import {useHistory} from "react-router-dom";

export default function PregnantTTCQuickActionsComponent() {
    const history = useHistory();
    const goToPage = (page)=>{
        history.push(page)
    }

    return (
        <div className="chips">
            <button className="chip" onClick={()=>goToPage('/dashboard/classes')}>
                <IonIcon icon={videocamOutline} />
                <span>Classes</span>
            </button>
            <button className="chip" onClick={()=>goToPage('/dashboard/tracker')}>
                <IonIcon icon={pulseOutline} />
                <span>Trackers</span>
            </button>
            <button className="chip">
                <IonIcon icon={peopleOutline} onClick={()=>goToPage('/dashboard/community')}/>
                <span>Community</span>
            </button>
            <button className="chip" onClick={()=>goToPage('/dashboard/settings')}>
                <IonIcon icon={settingsOutline} />
                <span>Settings</span>
            </button>
        </div>
    );
}
