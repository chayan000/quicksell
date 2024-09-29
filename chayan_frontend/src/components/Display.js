import React, { useEffect, useState } from 'react';
import SettingsIcon from './SettingsIcon';

function Display() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [groupOption, setGroupOption] = useState('Status'); // Default grouping option
    const [orderOption, setOrderOption] = useState('Priority'); // Default ordering option

    // Define the 5 statuses that should always appear
    const statusCategories = ['Todo', 'In progress', 'Backlog', 'Done', 'Canceled'];

    // Mapping priority values to colors and sort order
    const priorityStyles = {
        0: { label: 'No Priority', order: 5, color: '#808080' }, // Gray
        1: { label: 'Low', order: 4, color: '#2E8B57' }, // Green
        2: { label: 'Medium', order: 3, color: '#FFA500' }, // Orange
        3: { label: 'High', order: 2, color: '#FF6347' }, // Red
        4: { label: 'Urgent', order: 1, color: '#FF0000' }, // Bright Red
    };

    // Mapping statuses to specific colors
    const statusStyles = {
        'Todo': { color: '#1E90FF' }, // Blue
        'In progress': { color: '#FFD700' }, // Yellow
        'Backlog': { color: '#FF4500' }, // Orange Red
        'Done': { color: '#32CD32' }, // Lime Green
        'Canceled': { color: '#A9A9A9' }, // Dark Gray
    };

    useEffect(() => {
        fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
            .then((response) => response.json())
            .then((data) => {
                setTickets(data.tickets || []);
                setUsers(data.users || []);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const renderTickets = () => {
        let groupedTickets = {};

        // Group tickets based on selected group option
        if (groupOption === 'Status') {
            groupedTickets = statusCategories.reduce((acc, status) => {
                acc[status] = tickets.filter(ticket => ticket.status === status);
                return acc;
            }, {});
        } else if (groupOption === 'User') {
            groupedTickets = users.reduce((acc, user) => {
                acc[user.name] = tickets.filter(ticket => ticket.userId === user.id);
                return acc;
            }, {});
        } else if (groupOption === 'Priority') {
            groupedTickets = tickets.reduce((acc, ticket) => {
                const priorityLevel = priorityStyles[ticket.priority]?.label || 'Unknown'; // Get priority label
                acc[priorityLevel] = acc[priorityLevel] || [];
                acc[priorityLevel].push(ticket);
                return acc;
            }, {});
        }

        // Sort tickets if ordering is selected
        const sortedTickets = (tickets) => {
            if (orderOption === 'Title') {
                return tickets.sort((a, b) => a.title.localeCompare(b.title));
            } else {
                return tickets.sort((a, b) => {
                    const priorityA = priorityStyles[a.priority]?.order || 6; // Default to a higher value if unknown
                    const priorityB = priorityStyles[b.priority]?.order || 6; // Default to a higher value if unknown
                    return priorityA - priorityB; // Sort based on order
                });
            }
        };

        // Render the grouped tickets
        const sections = Object.keys(groupedTickets).map(group => (
            <div className="status-section" key={group}>
                <div className="cards_header">
                    <h4>{group} ({groupedTickets[group].length})</h4> {/* Display count */}
                    <h4>+ ...</h4>
                </div>
                <div className="card-container">
                    {groupedTickets[group].length === 0 ? (
                        <p>No tickets in this category.</p>
                    ) : (
                        sortedTickets(groupedTickets[group]).map((ticket, index) => {
                            // Find the user associated with the ticket
                            const user = users.find(u => u.id === ticket.userId);
                            // Get initials from the user's name
                            const initials = user ? user.name.split(' ').map(n => n[0].toUpperCase()).join('') : '';

                            // Determine what to display based on grouping option
                            const displayPriority = groupOption === 'Status' ? (
                                <span style={{ color: priorityStyles[ticket.priority]?.color }}>
                                    {priorityStyles[ticket.priority]?.label}
                                </span>
                            ) : '';
                            const displayStatus = (groupOption === 'User' || groupOption === 'Priority') ? (
                                <span style={{ color: statusStyles[ticket.status]?.color }}>
                                    {ticket.status}
                                </span>
                            ) : '';

                            return (
                                <div className="card" key={index}>
                                    <div className="dp-container">
                                        <div className="dp">{initials}</div> {/* DP with initials */}
                                        <div className={`status-dot ${user?.available ? 'online' : 'offline'}`}></div> {/* Status dot */}
                                    </div>
                                    <div className="ticket-details">
                                        <p>{ticket.id}</p>
                                        <h6>{ticket.title.length > 50 ? ticket.title.slice(0, 50) + '...' : ticket.title}</h6>
                                        <p2>{displayPriority || displayStatus}</p2> {/* Show priority or status based on grouping */}
                                        <p2>{ticket.tag.join(', ')}</p2>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        ));

        return sections;
    };

    const handleGroupOptionChange = (option) => {
        setGroupOption(option);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    const handleOrderOptionChange = (option) => {
        setOrderOption(option);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    return (
        <div>
            {/* Display Dropdown */}
            <div className="dropdown-container">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    ⚙ Display
                </button>

                {isDropdownOpen && (
                    <div className="dropdown-options">
                        <div className="grouping-options">
                            <span>Grouping: </span>
                            <select onChange={(e) => handleGroupOptionChange(e.target.value)} value={groupOption}>
                                <option value="Status">Status</option>
                                <option value="User">User</option>
                                <option value="Priority">Priority</option>
                            </select>
                        </div>
                        <div className="ordering-options">
                            <span>Ordering: </span>
                            <select onChange={(e) => handleOrderOptionChange(e.target.value)} value={orderOption}>
                                <option value="Priority">Priority</option>
                                <option value="Title">Title</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Render Tickets Based on Selection */}
            <div className="Display">
                {renderTickets()}
            </div>
        </div>
    );
}

export default Display;
