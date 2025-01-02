import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

// Functional component for navigation
function NavigateButton() {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/TicketFormLogin');
    };

    return (
        <button
            style={{
                padding: '12px 24px',
                fontSize: '16px',
                color: 'white',
                backgroundColor: 'green',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
            }}
            onClick={handleNavigate}
        >
            Having trouble finding your answer? Raise a Query
        </button>
    );
}

class LoginFaq extends Component {
    state = {
        activeTab: "Login",
    };

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab });
    };

    render() {
        const tabs = ["FAQ's"];

        const faqData = {
            Login: [
                {
                    section: "Generate Bill Facing Issues",
                    items: [
                        {
                            question: "1. Click on Remove/Add Row but extra row is not visible?",
                            answer: "Check all the information in the row and then try to add a new row.",
                        },
                        {
                            question: "2. Doctor information is not visible?",
                            answer: "Try logging in again and check the internet connection.",
                        },
                        {
                            question: "3. Data not visible in Description?",
                            answer: "Check the Description field and click on the Description to open the form."
                        },
                    ],
                },
                {
                    section: "Create Prescription Issues",
                    items: [
                        {
                            question: "1. Doctor Name not visible after logging in?",
                            answer: "Ensure your internet connection is working; if so, try logging in again.",
                        },
                        {
                            question: "2. Medical Observations details not visible?",
                            answer: "Add Medical Observations in the prescription table using the add option.",
                        },
                        {
                            question: "3. Medicine Name not visible?",
                            answer: "Check the Medicine Name dropdown or add it in the Medicine table.",
                        },
                        {
                            question: "4. Issue adding next row?",
                            answer: "Clear and add all components of the row, then try again.",
                        },
                        {
                            question: "5. Issue submitting prescription?",
                            answer: "Check all fields and try submitting again.",
                        },
                    ],
                },
                {
                    section: "Create Medicine",
                    items: [
                        {
                            question: "Issue when adding drug strength?",
                            answer: "Ensure all required fields are completed correctly.",
                        },
                    ],
                },
                {
                    section: "Prescription/PDF Share",
                    items: [
                        {
                            question: "Issue sharing bill?",
                            answer: "Try downloading the bill and sharing it manually.",
                        },
                    ],
                },
            ],
        };

        return (
            <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', maxWidth: '800px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    {tabs.map((tab, index) => (
                        <div
                            key={index}
                            onClick={() => this.handleTabChange(tab)}
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '10px',
                                borderBottom: this.state.activeTab === tab ? '2px solid green' : '2px solid transparent',
                                color: this.state.activeTab === tab ? 'green' : 'black',
                                fontWeight: this.state.activeTab === tab ? 'bold' : 'normal',
                                cursor: 'pointer',
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                {faqData[this.state.activeTab].map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: '24px' }}>
                        <h3>{section.section}</h3>
                        {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} style={{ marginBottom: '16px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px',
                                        background: '#f4f4f4',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        const answer = document.getElementById(`answer-${sectionIndex}-${itemIndex}`);
                                        if (answer) {
                                            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                                        }
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '16px' }}>{item.question}</p>
                                    <span>{'⥐'}</span>
                                </div>
                                <div
                                    id={`answer-${sectionIndex}-${itemIndex}`}
                                    style={{
                                        padding: '10px',
                                        background: '#f9f9f9',
                                        borderRadius: '8px',
                                        alignItems: 'start',
                                        display: 'none',
                                        fontSize: '16px',
                                        color: '#333',
                                    }}
                                >
                                    {item.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <NavigateButton />
                </div>
            </div>
        );
    }
}

export default LoginFaq;
