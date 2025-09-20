import React, { useState } from "react";
import { IonPage, IonContent, IonIcon, IonLoading } from "@ionic/react";
import { starSharp } from "ionicons/icons";
import {
    actionToGetUserSessionData,
    actionToSaveUserProfileData
} from "../apiHelper/CommonAction";

const ROLE = {
    PREGNANT_MOM: 2,
    TTC: 3,
};

const CreateRoleBasedFormPage = () => {
    const [form, setForm] = useState({
        role: ROLE.PREGNANT_MOM,
        full_name: "",
        due_date: "",
        father_name: "",
        first_pregnancy: false,
        last_period_date: "",
        cycle_length: "",
        period_length: "", // NEW
    });

    const [errors, setErrors] = useState({});
    const [loadingApiCall, setLoadingApiCall] = useState(false);

    const isPregnant = form.role === ROLE.PREGNANT_MOM;
    const isTTC = form.role === ROLE.TTC;

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const isValidDate = (yyyyMmDd) => /^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd);
    const todayISO = () => new Date().toISOString().slice(0, 10);

    const validateForm = () => {
        const newErrors = {};

        if (!form.full_name.trim()) newErrors.full_name = "Full Name is required";
        else if (form.full_name.trim().length > 150) newErrors.full_name = "Full Name must be at most 150 characters";
        if (!form.last_period_date) newErrors.last_period_date = "Last Period Date is required";
        if (!isValidDate(form.last_period_date)) newErrors.last_period_date = "Last Period Date must be YYYY-MM-DD";
        else if (form.last_period_date > todayISO()) newErrors.last_period_date = "Last Period Date cannot be in the future";

        if (isPregnant) {
            if(form.due_date) {
                if (!isValidDate(form.due_date)) newErrors.due_date = "Due Date must be YYYY-MM-DD";
                else if (form.due_date < todayISO()) newErrors.due_date = "Due Date cannot be in the past";
            }

            if (form.father_name && form.father_name.length > 150) {
                newErrors.father_name = "Father Name must be at most 150 characters";
            }
        }

        if (isTTC) {
            if (form.cycle_length === "" || form.cycle_length === null) {
                newErrors.cycle_length = "Average Cycle Length is required";
            } else {
                const cl = Number(form.cycle_length);
                if (!Number.isInteger(cl)) newErrors.cycle_length = "Cycle Length must be an integer";
                else if (cl < 20 || cl > 40) newErrors.cycle_length = "Enter valid cycle length (20–40 days)";
            }

            // NEW: period_length validation (typical 2–10 days)
            if (form.period_length === "" || form.period_length === null) {
                newErrors.period_length = "Period Length is required";
            } else {
                const pl = Number(form.period_length);
                if (!Number.isInteger(pl)) newErrors.period_length = "Period Length must be an integer";
                else if (pl < 2 || pl > 10) newErrors.period_length = "Enter valid period length (2–10 days)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Build payload
        const base = {
            role: form.role,
            full_name: form.full_name?.trim(),
            due_date: isPregnant ? form.due_date || null : null,
            father_name: isPregnant && form.father_name?.trim() ? form.father_name?.trim() : null,
            first_pregnancy: isPregnant ? (form.first_pregnancy ? 1 : 0) : null,
            last_period_date: form.last_period_date ?? null,
            cycle_length: isTTC ? Number(form.cycle_length) : null,
            period_length: isTTC ? Number(form.period_length) : null,
        };

        // If NOT (current schema), omit it to avoid backend errors:
        const payload = { ...base };

        setLoadingApiCall(true);
        actionToSaveUserProfileData(payload)
            .then(() => {
                actionToGetUserSessionData();
            })
            .finally(() => setLoadingApiCall(false));
    };

    const Label = ({ htmlFor, children, required }) => (
        <label htmlFor={htmlFor} className="flex items-center gap-1">
            {children}
            {required && (
                <IonIcon
                    icon={starSharp}
                    className="required-icon"
                    aria-label="required"
                    style={{ fontSize: 12, verticalAlign: "middle" }}
                />
            )}
        </label>
    );

    return (
        <IonPage>
            <div className="profile_setup_header_container">
                <h2 className="form-title">Profile Setup</h2>

                <div className="toggle-buttons">
                    <div
                        className={`toggle-btn ${isPregnant ? "active" : ""}`}
                        onClick={() => handleChange("role", ROLE.PREGNANT_MOM)}
                    >
                        Pregnant Mom
                    </div>
                    <div
                        className={`toggle-btn ${isTTC ? "active" : ""}`}
                        onClick={() => handleChange("role", ROLE.TTC)}
                    >
                        TTC
                    </div>
                </div>
            </div>

            <IonContent className="profile-setup-page">
                <form className="form-container" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <Label htmlFor="full_name" required>Full Name</Label>
                        <input
                            id="full_name"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.full_name}
                            onChange={(e) => handleChange("full_name", e.target.value)}
                            maxLength={150}
                        />
                        {errors.full_name && <p className="error">{errors.full_name}</p>}
                    </div>

                    {isPregnant && (
                        <>
                            <div className="form-group">
                                <Label htmlFor="due_date">Due Date</Label>
                                <input
                                    id="due_date"
                                    type="date"
                                    placeholder="yyyy-mm-dd"
                                    value={form.due_date}
                                    onChange={(e) => handleChange("due_date", e.target.value)}
                                />
                                {errors.due_date && <p className="error">{errors.due_date}</p>}
                            </div>

                            <div className="form-group">
                                <Label htmlFor="father_name">Father Name</Label>
                                <input
                                    id="father_name"
                                    type="text"
                                    placeholder="Optional"
                                    value={form.father_name}
                                    onChange={(e) => handleChange("father_name", e.target.value)}
                                    maxLength={150}
                                />
                                {errors.father_name && <p className="error">{errors.father_name}</p>}
                            </div>

                            <div className="form-group switch-field">
                                <Label htmlFor="first_pregnancy">First-time pregnancy</Label>
                                <div className="switch">
                                    <span>{form.first_pregnancy ? "Yes" : "No"}</span>
                                    <input
                                        type="checkbox"
                                        id="first_pregnancy"
                                        checked={form.first_pregnancy}
                                        onChange={(e) => handleChange("first_pregnancy", e.target.checked)}
                                    />
                                    <label htmlFor="first_pregnancy" className="switch-slider"></label>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <Label htmlFor="last_period_date" required>Last Period Date</Label>
                        <input
                            id="last_period_date"
                            type="date"
                            placeholder="yyyy-mm-dd"
                            value={form.last_period_date}
                            onChange={(e) => handleChange("last_period_date", e.target.value)}
                        />
                        {errors.last_period_date && <p className="error">{errors.last_period_date}</p>}
                    </div>

                    {isTTC && (
                        <>
                            <div className="form-group">
                                <Label htmlFor="cycle_length" required>Average Cycle Length (days)</Label>
                                <input
                                    id="cycle_length"
                                    type="number"
                                    placeholder="e.g. 28"
                                    value={form.cycle_length}
                                    onChange={(e) => handleChange("cycle_length", e.target.value)}
                                    inputMode="numeric"
                                    min={20}
                                    max={40}
                                />
                                {errors.cycle_length && <p className="error">{errors.cycle_length}</p>}
                            </div>

                            <div className="form-group">
                                <Label htmlFor="period_length" required>Last Period Length (days)</Label>
                                <input
                                    id="period_length"
                                    type="number"
                                    placeholder="e.g. 5"
                                    value={form.period_length}
                                    onChange={(e) => handleChange("period_length", e.target.value)}
                                    inputMode="numeric"
                                    min={2}
                                    max={10}
                                />
                                {errors.period_length && <p className="error">{errors.period_length}</p>}
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-btn">Save &amp; Continue</button>
                </form>
            </IonContent>

            <IonLoading
                className="loading_loader_spinner_container"
                isOpen={loadingApiCall}
                message={"Loading..."}
            />
        </IonPage>
    );
};

export default CreateRoleBasedFormPage;
