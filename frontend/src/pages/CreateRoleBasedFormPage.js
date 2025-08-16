import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import {useHistory} from "react-router-dom";

const CreateRoleBasedFormPage = () => {
    const [form, setForm] = useState({
        role: 'Pregnant Mom',
        fullName: '',
        dueDate: '',
        fatherName: '',
        firstPregnancy: true,
        language: 'English',
        lastPeriodDate: '',
        cycleLength: '',
    });

    const [errors, setErrors] = useState({});
    const history = useHistory();
    const goToPage = (page)=>{
        history.replace(page);
    }

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = "Full Name is required";
        }

        if (form.role === 'Pregnant Mom') {
            if (!form.dueDate) newErrors.dueDate = "Due Date is required";
        }

        if (form.role === 'TTC') {
            if (!form.lastPeriodDate) newErrors.lastPeriodDate = "Last Period Date is required";
            if (!form.cycleLength) {
                newErrors.cycleLength = "Average Cycle Length is required";
            } else if (Number(form.cycleLength) < 20 || Number(form.cycleLength) > 40) {
                newErrors.cycleLength = "Enter valid cycle length (20-40 days)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form submitted:", form);
            alert("Form submitted successfully!");
        }
    };

    return (
        <IonPage>
            <IonContent className="profile-setup-page">
                <form className="form-container" onSubmit={handleSubmit}>
                    <h2 className="form-title">Profile Setup</h2>

                    {/* Role Toggle */}
                    <div className="toggle-buttons">
                        <button
                            type="button"
                            className={`toggle-btn ${form.role === "Pregnant Mom" ? "active" : ""}`}
                            onClick={() => handleChange("role", "Pregnant Mom")}>
                            Pregnant Mom
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${form.role === "TTC" ? "active" : ""}`}
                            onClick={() => handleChange("role", "TTC")}>
                            TTC
                        </button>
                    </div>

                    {/* Full Name */}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                        />
                        {errors.fullName && <p className="error">{errors.fullName}</p>}
                    </div>

                    {/* Pregnant Mom Fields */}
                    {form.role === "Pregnant Mom" && (
                        <>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => handleChange("dueDate", e.target.value)}
                                />
                                {errors.dueDate && <p className="error">{errors.dueDate}</p>}
                            </div>

                            <div className="form-group">
                                <label>Father Name</label>
                                <input
                                    type="text"
                                    placeholder="Optional"
                                    value={form.fatherName}
                                    onChange={(e) => handleChange("fatherName", e.target.value)}
                                />
                            </div>

                            <div className="form-group switch-field">
                                <label>First-time pregnancy</label>
                                <div className="switch">
                                    <span>{form.firstPregnancy ? "Yes" : "No"}</span>
                                    <input
                                        type="checkbox"
                                        id="firstPregnancy"
                                        checked={form.firstPregnancy}
                                        onChange={(e) => handleChange("firstPregnancy", e.target.checked)}
                                    />
                                    <label htmlFor="firstPregnancy" className="switch-slider"></label>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TTC Fields */}
                    {form.role === "TTC" && (
                        <>
                            <div className="form-group">
                                <label>Last Period Date</label>
                                <input
                                    type="date"
                                    value={form.lastPeriodDate}
                                    onChange={(e) => handleChange("lastPeriodDate", e.target.value)}
                                />
                                {errors.lastPeriodDate && <p className="error">{errors.lastPeriodDate}</p>}
                            </div>

                            <div className="form-group">
                                <label>Average Cycle Length</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 28"
                                    value={form.cycleLength}
                                    onChange={(e) => handleChange("cycleLength", e.target.value)}
                                />
                                {errors.cycleLength && <p className="error">{errors.cycleLength}</p>}
                            </div>
                        </>
                    )}

                    {/* Common Field */}
                    <div className="form-group">
                        <label>Language</label>
                        <select
                            value={form.language}
                            onChange={(e) => handleChange("language", e.target.value)}
                        >
                            <option value="English">English</option>
                            <option value="हिन्दी">हिन्दी</option>
                        </select>
                    </div>

                    <button type="submit" onClick={()=>goToPage('/dashboard')} className="submit-btn">Save & Continue</button>
                </form>
            </IonContent>
        </IonPage>
    );
};

export default CreateRoleBasedFormPage;
