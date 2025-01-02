import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, Button, TextInput, Select, Group, ActionIcon } from "@mantine/core";
import { ArrowDown, ArrowUp } from "tabler-icons-react";

const TicketTable = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const navigate = useNavigate();

  const productNames = {
    1: "Dr Assist",
    2: "Aqua Logix",
  };

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const productId = 2;
  const userId = userData?.user?.id;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/tickets/${productId}/${userId}`
        );
  
        const sortedTickets = response.data.sort((a, b) => b.id - a.id);
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Unable to fetch tickets.");
      } finally {
        setLoading(false);
      }
    };
  
    if (productId && userId) {
      fetchTickets();
    }
  }, [productId, userId]);

  useEffect(() => {
    const filtered = tickets.filter((ticket) => {
      const isProductMatch = productId ? ticket.products_id === productId : true;
      const isUserMatch = userId ? ticket.user_id === userId : true;
      const searchMatch =
        ticket.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (productNames[ticket.products_id] || "").toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === null || ticket.status === statusFilter;

      return isProductMatch && isUserMatch && searchMatch && statusMatch;
    });
    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, tickets, productId, userId]);

  const handleDelete = async (ticketId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tickets/${ticketId}`);
      setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
    } catch {
      alert("Failed to delete ticket");
    }
  };

  const handleAssign = (ticketId) => navigate(`/ExistingTicketView/${ticketId}`);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sortedTickets = [...filteredTickets].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredTickets(sortedTickets);
    setSortConfig({ key, direction });
  };

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p>{error}</p>;

  const getRowBackgroundColor = (status) => {
    if (status === 0) return "#bbdefb"; // New - Light Blue
    if (status === 1) return "#fff9c4"; // In Process - Light Yellow
    return "#ffcdd2"; // Closed - Light Red
  };

  return (
    <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "16px" }}>Existing Tickets</h1>
      <Group position="apart" style={{ marginBottom: "16px" }}>
        <TextInput
          placeholder="Search by Client Name, Email, or Product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "300px" }}
        />
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: null, label: "All" },
            { value: 0, label: "New" },
            { value: 1, label: "In Process" },
            { value: 2, label: "Closed" },
          ]}
          style={{ width: "200px" }}
        />
      </Group>
      <Table
        striped
        highlightOnHover
        style={{
          border: "2px solid black",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }} onClick={() => handleSort("id")}>
              Ticket ID{" "}
              {sortConfig.key === "id" &&
                (sortConfig.direction === "asc" ? <ArrowUp /> : <ArrowDown />)}
            </th>
            <th style={{ border: "1px solid black" }} onClick={() => handleSort("products_id")}>
              Product{" "}
              {sortConfig.key === "products_id" &&
                (sortConfig.direction === "asc" ? <ArrowUp /> : <ArrowDown />)}
            </th>
            <th style={{ border: "1px solid black" }} onClick={() => handleSort("client_name")}>
              Client Name{" "}
              {sortConfig.key === "client_name" &&
                (sortConfig.direction === "asc" ? <ArrowUp /> : <ArrowDown />)}
            </th>
            <th style={{ border: "1px solid black" }}>Email</th>
            <th style={{ border: "1px solid black" }}>Mobile</th>
            <th style={{ border: "1px solid black" }}>Query</th>
            <th style={{ border: "1px solid black" }}>Screenshots</th>
            <th style={{ border: "1px solid black" }}>Status</th>
            <th style={{ border: "1px solid black" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((ticket) => (
            <tr
              key={ticket.id}
              style={{
                backgroundColor: getRowBackgroundColor(ticket.status),
                border: "1px solid black",
              }}
            >
              <td style={{ border: "1px solid black" }}>{ticket.id}</td>
              <td style={{ border: "1px solid black" }}>
                {productNames[ticket.products_id] || "Unknown"}
              </td>
              <td style={{ border: "1px solid black" }}>{ticket.client_name}</td>
              <td style={{ border: "1px solid black" }}>{ticket.email || "No Email"}</td>
              <td style={{ border: "1px solid black" }}>{ticket.mobile || "No Mobile"}</td>
              <td style={{ border: "1px solid black" }}>{ticket.query || "No Query"}</td>
              <td style={{ border: "1px solid black" }}>
                {ticket.screen_shot && Array.isArray(ticket.screen_shot)
                  ? ticket.screen_shot.map((screenshot, index) => (
                      <a
                        key={index}
                        href={`http://127.0.0.1:8000${screenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={`http://127.0.0.1:8000${screenshot}`}
                          alt={`Screenshot ${index}`}
                          style={{ width: "40px", height: "40px" }}
                        />
                      </a>
                    ))
                  : "No Screenshot"}
              </td>
              <td style={{ border: "1px solid black" }}>
                {ticket.status === 0
                  ? "New"
                  : ticket.status === 1
                  ? "In Process"
                  : "Closed"}
              </td>
              <td style={{ padding: "10px", textAlign: "center", border: "2px solid black" }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <Button
                           color="green"
                           onClick={() => handleAssign(ticket.id)}
                           style={{ padding: "6px 10px", fontSize: "14px" }}
                          >
                          View
                          </Button>
                          <Button
                          color="red"
                          onClick={() => handleDelete(ticket.id)}
                          style={{ padding: "6px 10px", fontSize: "14px" }}
                           >
                           Delete
                          </Button>
                         </div>
                        </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TicketTable;
