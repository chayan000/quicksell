import React, { useEffect, useState } from 'react';
import { ReactComponent as DisplayIcon } from '../icons_FEtask/Display.svg';
import { ReactComponent as Add } from '../icons_FEtask/add.svg';
import { ReactComponent as Threedot } from '../icons_FEtask/3 dot menu.svg';
import { ReactComponent as Todo } from '../icons_FEtask/To-do.svg';
import { ReactComponent as Done } from '../icons_FEtask/Done.svg';
import { ReactComponent as Backlog } from '../icons_FEtask/Backlog.svg';
import { ReactComponent as Cancelled } from '../icons_FEtask/Cancelled.svg';
import { ReactComponent as Inprogress } from '../icons_FEtask/in-progress.svg';
import { ReactComponent as Urgent } from '../icons_FEtask/SVG - Urgent Priority colour.svg';
import { ReactComponent as High } from '../icons_FEtask/Img - High Priority.svg';
import { ReactComponent as Medium } from '../icons_FEtask/Img - Medium Priority.svg';
import { ReactComponent as Low } from '../icons_FEtask/Img - Low Priority.svg';
import { ReactComponent as NoPriority } from '../icons_FEtask/No-priority.svg';

function Display() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const savedGroupOption = localStorage.getItem('groupOption') || 'Status';
    const savedOrderOption = localStorage.getItem('orderOption') || 'Priority';

    const [groupOption, setGroupOption] = useState(savedGroupOption);
    const [orderOption, setOrderOption] = useState(savedOrderOption);

    const statusCategories = ['Todo', 'In progress', 'Backlog', 'Done', 'Cancelled'];

    const priorityStyles = {
        0: { label: 'No Priority', order: 5, icon: <NoPriority /> },
        1: { label: 'Low', order: 4, icon: <Low /> },
        2: { label: 'Medium', order: 3, icon: <Medium /> },
        3: { label: 'High', order: 2, icon: <High /> },
        4: { label: 'Urgent', order: 1, icon: <Urgent /> },
    };

    const statusStyles = {
        'Todo': { color: '#1E90FF', icon: <Todo /> },
        'In progress': { color: '#FFD700', icon: <Inprogress /> },
        'Backlog': { color: '#FF4500', icon: <Backlog /> },
        'Done': { color: '#32CD32', icon: <Done /> },
        'Cancelled': { color: '#A9A9A9', icon: <Cancelled /> },
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
                const priorityLevel = priorityStyles[ticket.priority]?.label || 'No Priority';
                acc[priorityLevel] = acc[priorityLevel] || [];
                acc[priorityLevel].push(ticket);
                return acc;
            }, {});
        }

        const sortedTickets = (tickets) => {
            if (orderOption === 'Title') {
                return tickets.sort((a, b) => a.title.localeCompare(b.title));
            } else {
                return tickets.sort((a, b) => {
                    const priorityA = priorityStyles[a.priority]?.order || 6;
                    const priorityB = priorityStyles[b.priority]?.order || 6;
                    return priorityA - priorityB;
                });
            }
        };

        const sections = Object.keys(groupedTickets).map(group => (
            <div className="status-section" key={group}>
                <div className="cards_header">
                    <h4>
                        {groupOption === 'Priority' && priorityStyles[group]?.icon} 
                        {groupOption !== 'Priority' && statusStyles[group]?.icon} 
                        {group} ({groupedTickets[group].length})
                    </h4>
                    <h4><Add /><Threedot /></h4>
                </div>
                <div className="card-container">
                    {groupedTickets[group].length === 0 ? (
                        <p>No tickets in this category.</p>
                    ) : (
                        sortedTickets(groupedTickets[group]).map((ticket, index) => {
                            const user = users.find(u => u.id === ticket.userId);
                            const initials = user ? user.name.split(' ').map(n => n[0].toUpperCase()).join('') : '';
                            const statusIcon = statusStyles[ticket.status]?.icon;
                            const priorityIcon = priorityStyles[ticket.priority]?.icon;

                            return (
                                <div className="card" key={index}>
                                    {groupOption != 'User' && <div className="dp-container">
                                        <div className="dp">{initials}</div>
                                        <div className={`status-dot ${user?.available ? 'online' : 'offline'}`}></div>
                                    </div> }
                                    
                                    <div className="ticket-details">
                                        <p>{ticket.id}</p>
                                        <h6>{ticket.title.length > 50 ? ticket.title.slice(0, 50) + '...' : ticket.title}</h6>
                                        <div className="icon-tag-container">
                                            {groupOption === 'Status' && <p className="icon">{priorityIcon}</p>}
                                            {groupOption === 'User' && <p className="icon">{statusIcon}</p>}
                                            {groupOption === 'User' && <p className="icon">{priorityIcon}</p>}
                                            {groupOption === 'Priority' && <p className="icon">{statusIcon}</p>}

                                            <p className="tags">{ticket.tag.join(', ')}</p>
                                        </div>
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
        localStorage.setItem('groupOption', option);
        setIsDropdownOpen(false);
    };

    const handleOrderOptionChange = (option) => {
        setOrderOption(option);
        localStorage.setItem('orderOption', option);
        setIsDropdownOpen(false);
    };

    return (
        <div>
            <div className="dropdown-container">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <DisplayIcon /> Display
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

            <div className="Display">
                {renderTickets()}
            </div>
        </div>
    );
}

export default Display;
