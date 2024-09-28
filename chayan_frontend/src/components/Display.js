import React, { useEffect, useState } from 'react';

function Display() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [groupBy, setGroupBy] = useState('Status'); // Default grouping by Status
    const [sortBy, setSortBy] = useState('Priority'); // Default sorting by Priority

    useEffect(() => {
        // Fetch data from API
        fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched data:", data);
                setTickets(data.tickets || []);
                setUsers(data.users || []);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    // Helper function to categorize tickets by user
    const getTicketsByUser = (userId) => {
        return tickets.filter(ticket => ticket.userId === userId);
    };

    // Helper function to sort tickets
    const sortTickets = (tickets) => {
        if (sortBy === 'Priority') {
            return [...tickets].sort((a, b) => b.priority - a.priority);
        } else if (sortBy === 'Title') {
            return [...tickets].sort((a, b) => a.title.localeCompare(b.title));
        }
        return tickets;
    };

    // Handle change in dropdown selection for grouping
    const handleGroupChange = (e) => {
        setGroupBy(e.target.value);
    };

    // Handle change in dropdown selection for sorting
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    // Render tickets based on grouping
    const renderTickets = () => {
        let groupedTickets;
    
        if (groupBy === 'Status') {
            groupedTickets = tickets.reduce((acc, ticket) => {
                acc[ticket.status] = acc[ticket.status] || [];
                acc[ticket.status].push(ticket);
                return acc;
            }, {});
        } else if (groupBy === 'User') {
            groupedTickets = users.reduce((acc, user) => {
                acc[user.name] = tickets.filter(ticket => ticket.userId === user.id);
                return acc;
            }, {});
        } else if (groupBy === 'Priority') {
            groupedTickets = tickets.reduce((acc, ticket) => {
                const priorityLevel = ticket.priority === 0 ? 'No Priority' : ticket.priority;
                acc[priorityLevel] = acc[priorityLevel] || [];
                acc[priorityLevel].push(ticket);
                return acc;
            }, {});
        }
    
        // Create an array of sections for the headings
        const sections = Object.keys(groupedTickets).map(group => (
            <div className="status-section" key={group}>
                <h2>{group}</h2>
                <div className="card-container">
                    {sortTickets(groupedTickets[group]).map((ticket, index) => (
                        <div className="card" key={index}>
                            <p>{ticket.id}</p>
                            <h6>{ticket.title.length > 30 ? ticket.title.slice(0, 30) + '...' : ticket.title}</h6>
                            <p>{ticket.tag.join(', ')}</p>
                        </div>
                    ))}
                </div>
            </div>
        ));
    
        return sections;
    };
    

    return (
        <div>
            {/* Dropdown for choosing grouping */}
            <div className="dropdown-container">
                <select value={groupBy} onChange={handleGroupChange}>
                    <option value="Status">Group By Status</option>
                    <option value="User">Group By User</option>
                    <option value="Priority">Group By Priority</option>
                </select>

                {/* Dropdown for choosing sorting */}
                <select value={sortBy} onChange={handleSortChange}>
                    <option value="Priority">Sort by Priority</option>
                    <option value="Title">Sort by Title</option>
                </select>
            </div>

            <div className="Display">
                {renderTickets()}
            </div>
        </div>
    );
}

export default Display;
