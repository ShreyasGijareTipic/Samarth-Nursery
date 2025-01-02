import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

// Functional component for navigation
function NavigateButton() {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/TicketForms');
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
            You are trouble to find your answer? Then Raise Query
        </button>
    );
}

class Faq extends Component {
    state = {
        activeTab: "Login",
    };

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab });
    };

    render() {
        const tabs = ["Login", "Subscription", "Contact with Us"];

        const faqData = {
            Login: [
                {
                    section: "Login issues",
                    items: [
                        {
                            question: "1. Unable to login to Assess.",
                            answer: (
                                <ol>
                                    <li>If you are connected to the internet, enter the username provided (case-sensitive) and check the password.</li>
                                    <li>If you forget your password, contact our team at "customer.care@tipic.co.in".</li>
                                </ol>
                            )
                        },
                        {
                            question: "2. Forget user Id and Password?",
                            answer: `Send an email to "customer.care@tipic.co.in" with your contact number and verify email details.`
                        },
                        {
                            question: "3. Getting blank screen/page not loading?",
                            answer: "Ensure you're using the latest version of Chrome or Firefox. Clear browser cache (ctrl+shift+delete) and try again."
                        },
                    ],
                },
            ],
            Subscription: [
                {
                    section: "Subscription Plan Details",
                    items: [
                        {
                            question: "Subscription plans activate but still not updated?",
                            answer: "Ensure that your payment has been processed successfully."
                        },
                        {
                            question: "Can I upgrade my subscription?",
                            answer: "Yes, you can upgrade your subscription anytime from your account settings."
                        },
                    ],
                },
            ],
            "Contact with Us": [
                {
                    section: "Contact Information",
                items: [
                        {
                            question: "How can I reach customer support?",
                            answer: <a href="https://tipic.co.in/#/Contact" target="_blank" rel="noopener noreferrer">Fill out the form through this link</a>
                        },
                        {
                            question: "What are your working hours?",
                            answer: "Our support team is available Monday to Friday, 9 AM to 6 PM."
                        },
                    ],
                },
            ]
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

export default Faq;
