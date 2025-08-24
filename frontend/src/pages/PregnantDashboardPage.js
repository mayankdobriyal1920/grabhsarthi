import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import {
    videocamOutline,
    libraryOutline,
    pulseOutline,
    peopleOutline,
    leafOutline,
    flame
} from "ionicons/icons";
import {_babyWeeklyGrowthContentSvg} from "../apiHelper/CommonHelper";

export default function PregnantDashboardPage({ handleScroll }) {
    // progress example: 3/4 tasks = 75%
    const progress = 0.75;

    return (
        <IonPage>
            <IonContent
                fullscreen
                scrollEvents={true}
                onIonScroll={handleScroll}
                className="dash --peach-bg pregnant-dashboard main-contant-page">
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, Monika Ji!</h1>
                        <p>You’re in {_babyWeeklyGrowthContentSvg[0].week}</p>
                    </div>

                    <div className="baby-growth-card">
                        <h2>Baby Growth Snapshot</h2>
                        <div className="content">
                            <div className="baby-blob">
                                <img src={_babyWeeklyGrowthContentSvg[3].icon} className={"baby-svg"}/>
                            </div>
                            <div className="progress-box">
                            <div className={"progress_bar_div_with_percentage"}>
                                <h3>{_babyWeeklyGrowthContentSvg[0].weight}</h3>
                                <div className={"percentage_bar_main"}>
                                    <div style={{width: `${progress}%`}} className={"fill_bar"}></div>
                                </div>
                            </div>
                            <span>Weekly progress {progress}%</span>
                        </div>
                        </div>
                        <p className="description">
                            {_babyWeeklyGrowthContentSvg[0].description}
                        </p>
                    </div>

                    {/* Daily Tasks */}
                    <div className="card tasks">
                        <h3>Daily Tasks</h3>

                        <div className="tasks-grid">
                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#e08500" height="40px" width="40px"
                                         version="1.1" id="Capa_1" viewBox="0 0 370.001 370.001">
                                        <g>
                                            <path
                                                d="M260.422,314.065c-3.338-0.517-5.858-0.875-7.909-1.164c-6.301-0.895-7.993-1.135-15.359-3.428   c-2.903-0.904-14.259-12.358-14.259-34.775c0-28.879,6.857-54.382,9.803-64.005c0.078-0.251,0.27-0.978,0.536-1.962   c0.487-1.807,4.062-12.719,4.062-12.719c1.938-5.551,3.944-11.293,5.247-17.191l0.07-0.302c1.967-8.54,8.424-39.756,8.882-82.935   c0-4.357-3.622-8.148-5.785-10.412c-0.396-0.416-0.747-0.78-1.009-1.086c-2.083-2.422-4.825-5.412-8.001-8.872   c-2.092-2.282-4.396-4.796-6.879-7.546c-3.972-4.393-8.401-8.412-12.686-12.297c-5.269-4.775-10.714-9.713-15.189-15.28   c-6.688-8.317-12.871-22.874-11.752-34.606c0.17-1.77-0.243-3.299-1.162-4.309c-1.02-1.123-2.62-1.473-4.029-0.916   c-1.411-0.557-3.012-0.207-4.03,0.916c-0.918,1.01-1.333,2.539-1.161,4.309c1.117,11.732-5.066,26.289-11.752,34.606   c-4.477,5.567-9.922,10.505-15.191,15.28c-4.283,3.885-8.715,7.904-12.685,12.297c-2.482,2.75-4.789,5.264-6.88,7.546   c-3.177,3.46-5.917,6.45-8.002,8.872c-0.262,0.306-0.61,0.67-1.007,1.086c-2.163,2.264-5.786,6.055-5.786,10.434   c0.459,43.157,6.916,74.373,8.883,82.913l0.069,0.302c1.303,5.898,3.31,11.641,5.246,17.191c0,0,3.574,10.912,4.061,12.719   c0.267,0.984,0.46,1.711,0.538,1.962c2.945,9.623,9.801,35.126,9.801,64.005c0,22.418-11.355,33.871-14.257,34.775   c-7.366,2.293-9.059,2.533-15.361,3.428c-2.051,0.289-4.569,0.647-7.907,1.164c-36.177,3.85-40.083,21.809-40.083,29.353   c0,2.022,1.047,8.592,5.822,14.649c4.291,5.442,12.837,11.933,29.195,11.933c2.454,0,5.05-0.146,7.718-0.434   c10.887-1.17,21.859-2.928,32.468-4.627c3.854-0.617,7.701-1.233,11.555-1.824c5.134-0.787,14.387-1.309,27.498-1.549   c0.614-0.012,1.041-0.021,1.248-0.027c0.207,0.006,0.634,0.016,1.246,0.027c13.113,0.24,22.365,0.762,27.5,1.549   c3.852,0.591,7.7,1.207,11.553,1.824c10.61,1.699,21.583,3.457,32.468,4.627c2.668,0.287,5.264,0.434,7.718,0.434   c16.361,0,24.909-6.488,29.197-11.933c4.775-6.056,5.82-12.628,5.82-14.649C300.503,335.874,296.599,317.915,260.422,314.065z    M204.132,167.036c-0.539,0-1.05-0.117-1.567-0.362c-1.683-0.671-3.841-3.886-4.042-5.134c8.382-5.832,14.045-16.91,14.045-29.625   c0-18.777-1.982-34-27.567-34s-27.567,15.223-27.567,34c0,12.715,5.663,23.793,14.044,29.625c-0.197,1.245-2.404,4.307-4.041,5.134   c-0.516,0.245-1.026,0.362-1.567,0.362c-5.387,0.002-12.139-11.797-13.912-16.492c-3.021-7.977-6.792-21.688-7.601-41.697   l-0.033-0.77c-0.207-4.215,6.142-14.994,6.983-16.838c1.156-2.539,16.154-25.4,20.608-30.816   c1.577-1.915,9.566-12.523,13.087-17.205c3.52,4.682,11.508,15.29,13.084,17.205c4.457,5.416,19.451,28.277,20.609,30.816   c0.842,1.844,7.191,12.623,6.985,16.838l-0.033,0.77c-0.81,20.01-4.579,33.721-7.603,41.697   C216.271,155.238,209.521,167.036,204.132,167.036z"/>
                                        </g>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '40%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>40%</div>
                                    </div>
                                </div>
                                <span>Yoga</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#966dff" height="40px" width="40px"
                                         version="1.1" id="Capa_1" viewBox="0 0 380 380">
                                        <g>
                                            <path
                                                d="M182.013,68.944c0-0.659-0.057-1.306-0.158-1.936   c-0.926,5.649-5.825,9.964-11.737,9.964s-10.811-4.314-11.739-9.964c-0.102,0.63-0.16,1.276-0.16,1.936   c0,6.569,5.328,11.897,11.899,11.897C176.688,80.842,182.013,75.514,182.013,68.944z"/>
                                            <path
                                                d="M209.882,80.842c6.572,0,11.898-5.328,11.898-11.897   c0-0.659-0.061-1.306-0.158-1.936c-0.927,5.649-5.828,9.964-11.74,9.964c-5.911,0-10.81-4.314-11.737-9.964   c-0.101,0.63-0.157,1.276-0.157,1.936C197.987,75.514,203.314,80.842,209.882,80.842z"/>
                                            <path
                                                d="M329.905,319.342c0,0-15.82-22.666-55.264-29.025   c8.627-7.418,16.863-14.328,24.899-21.48c8.654-7.727,11.936-16.977,8.332-28.564c-9.109-29.152-17.363-45.352-26.965-74.33   c-6.992-21.13-21.853-33.203-44.998-33.684c-4.307-0.086-8.872-0.844-12.799-2.506c-1.748-0.739-3.167-1.584-4.278-2.512   c-0.038-3.542,0.852-8.541,3.763-15.525c4.902-5.743,8.129-12.717,10.446-19.777c2.109-0.595,4.054-1.781,4.626-2.639   c2.231-3,6.363-6.777,7.913-10.275c3.161-7.846,0.297-11.859-1.19-13.049c-1.459-1.215-3.044-1.32-4.617-0.816   c0.437-1.481,0.898-2.95,1.444-4.398c5.604-14.83-1.742-29.617-16.232-36.921c-5.038-2.54-9.665-4.217-13.92-5.341   C209.89,8.093,200.91,0,190.001,0c-10.91,0-19.892,8.093-21.067,18.498c-4.255,1.124-8.882,2.801-13.921,5.341   c-14.488,7.304-21.834,22.091-16.231,36.921c0.546,1.448,1.009,2.918,1.445,4.4c-1.573-0.506-3.158-0.402-4.617,0.814   c-1.488,1.189-4.352,5.203-1.191,13.049c1.548,3.498,5.682,7.275,7.915,10.275c0.57,0.858,2.516,2.043,4.624,2.639   c2.132,6.495,5.034,12.919,9.302,18.379c0,0,4.287,8.332,6.622,15.096c-1.174,1.665-3.155,3.14-5.993,4.34   c-3.927,1.662-8.492,2.42-12.799,2.506c-23.144,0.48-38.006,12.554-44.998,33.684c-9.602,28.979-17.855,45.178-26.965,74.33   c-3.604,11.588-0.322,20.838,8.332,28.564c8.036,7.152,16.272,14.063,24.899,21.48c-39.443,6.359-55.264,29.025-55.264,29.025   C39.708,331.147,18.273,380,95.623,380h188.754C361.727,380,340.292,331.147,329.905,319.342z M130.92,270.641   c-7.604-3.676-20.056-18.707-18.714-24.473c4.927-14.504,10.925-25.434,18.714-39.496V270.641z M148.411,72.299   c-0.426-2.025-0.83-3.937-1.246-5.762c-1.682-7.358,1.066-16.242,7.538-24.363h70.592c6.475,8.121,9.224,17.005,7.539,24.363   c-0.415,1.825-0.819,3.736-1.246,5.762c-2.06,9.774-4.626,21.936-10.646,31.229c-6.81,10.505-16.93,15.612-30.94,15.612   c-14.014,0-24.135-5.107-30.942-15.612C153.038,94.234,150.472,82.072,148.411,72.299z M249.08,270.641v-63.969   c7.789,14.063,13.787,24.992,18.714,39.496C269.137,251.934,256.684,266.965,249.08,270.641z"/>
                                        </g>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '20%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>20%</div>
                                    </div>
                                </div>
                                <span>Meditation</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px"
                                         viewBox="0 0 24 24" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M22 12C22 17.5228 17.5228 22 12 22C10.4003 22 8.88837 21.6244 7.54753 20.9565C7.19121 20.7791 6.78393 20.72 6.39939 20.8229L4.17335 21.4185C3.20701 21.677 2.32295 20.793 2.58151 19.8267L3.17712 17.6006C3.28001 17.2161 3.22094 16.8088 3.04346 16.4525C2.37562 15.1116 2 13.5997 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM7.5 11.1084C7.5 12.4768 8.81884 13.9126 10.0286 14.9417C10.8524 15.6426 11.2644 15.9931 12 15.9931C12.7356 15.9931 13.1476 15.6426 13.9714 14.9417C15.1812 13.9126 16.5 12.4768 16.5 11.1084C16.5 8.43124 14.0249 7.43172 12 9.4998C9.97507 7.43172 7.5 8.43124 7.5 11.1084Z"
                                              fill="#ff9380"/>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '70%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>70%</div>
                                    </div>
                                </div>
                                <span>Samvaad</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px"
                                         viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M13.75 2C13.75 1.58579 13.4142 1.25 13 1.25C12.5858 1.25 12.25 1.58579 12.25 2V14.5359C11.4003 13.7384 10.2572 13.25 9 13.25C6.37665 13.25 4.25 15.3766 4.25 18C4.25 20.6234 6.37665 22.75 9 22.75C11.6234 22.75 13.75 20.6234 13.75 18V6.243C14.9875 7.77225 16.8795 8.75 19 8.75C19.4142 8.75 19.75 8.41421 19.75 8C19.75 7.58579 19.4142 7.25 19 7.25C16.1005 7.25 13.75 4.8995 13.75 2Z"
                                            fill="#f491f2"/>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '10%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>10%</div>
                                    </div>
                                </div>
                                <span>Mantra</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#84dcff" width="40px" height="40px"
                                         viewBox="0 0 32 32" version="1.1">
                                        <path
                                            d="M25.378 19.75c1.507 6.027-3.162 11.25-9.375 11.25s-10.9-5.149-9.375-11.25c0.937-3.75 5.625-9.375 9.375-18.75 3.75 9.374 8.438 15 9.375 18.75z"/>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '30%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>30%</div>
                                    </div>
                                </div>
                                <span>Hydration</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px"
                                         viewBox="0 0 24 24" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.00006 9C9.55234 9 10.0001 9.44772 10.0001 10V10.0112C10.0001 10.5635 9.55234 11.0112 9.00006 11.0112C8.44777 11.0112 8.00006 10.5635 8.00006 10.0112V10C8.00006 9.44772 8.44777 9 9.00006 9ZM7.39948 13.2004C7.84107 12.8687 8.46793 12.9578 8.79962 13.3994C9.53108 14.3732 10.6924 15 12.0004 15C13.3084 15 14.4698 14.3732 15.2012 13.3994C15.5329 12.9578 16.1598 12.8687 16.6014 13.2004C17.043 13.5321 17.132 14.159 16.8004 14.6006C15.7074 16.0557 13.9641 17 12.0004 17C10.0368 17 8.29344 16.0557 7.20049 14.6006C6.8688 14.159 6.95789 13.5321 7.39948 13.2004ZM16.0001 10C16.0001 9.44772 15.5523 9 15.0001 9C14.4478 9 14.0001 9.44772 14.0001 10V10.0112C14.0001 10.5635 14.4478 11.0112 15.0001 11.0112C15.5523 11.0112 16.0001 10.5635 16.0001 10.0112V10Z"
                                              fill="#FFC107"/>
                                    </svg>
                                    <div className={"progress_bar_div_with_percentage"}>
                                        <div className={"percentage_bar_main"}>
                                            <div style={{width: '80%'}} className={"fill_bar"}></div>
                                        </div>
                                        <div className={"percentage_bar_text"}>80%</div>
                                    </div>
                                </div>
                                <span>Mood</span>
                            </div>
                        </div>

                        <div className="progress-row">
                            <span className="muted s">3/4 tasks completed</span>
                            <div className="track">
                                <div
                                    className="fill"
                                    style={{width: `${progress * 100}%`}}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="chips">
                        <button className="chip">
                            <IonIcon icon={videocamOutline}/>
                            <span>Live Classes</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={libraryOutline}/>
                            <span>Video Library</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={pulseOutline}/>
                            <span>Trackers</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={peopleOutline}/>
                            <span>Community</span>
                        </button>
                    </div>

                    {/* Wellness Streak */}
                    <div className="streak card">
                        <div className="streak-left">
                            <div className="circle">
                                <IonIcon icon={leafOutline}/>
                            </div>
                            <div className="streak-text">
                                <span className="muted">3-day wellness</span>
                                <span className="b">streak</span>
                            </div>
                        </div>
                        <div className="streak-right">
                            <div className="circle solid">
                                <IonIcon icon={flame}/>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
