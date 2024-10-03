// pages/events/index.js

import { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/router';

export default function Events({ user }) {

  const apiUrl = process.env.NEXT_PUBLIC_EVENT_API_URL;

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`${apiUrl}/api/events`)
      .then(response => response.json())
      .then(data => {
        setEvents(data.events);
        setFilteredEvents(data.events);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredEvents(
        events.filter(event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      });
      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(events.map(event => event._id === eventId ? updatedEvent.event : event));
      } else {
        console.error('Error joining event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events</h2>
        <Button variant="primary" onClick={handleCreateEvent}>Create Event</Button>
      </div>
      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search for events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form>
      <Row>
        {filteredEvents.map(event => (
          <Col key={event._id} xs={12} md={6} lg={4} className="mb-4">
            <Card onClick={() => router.push(`/events/${event._id}`)} style={{ cursor: 'pointer' }}>
              {event.imageUrl && <Card.Img variant="top" src={event.imageUrl} />}
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>
                <Card.Text>{event.description}</Card.Text>
                <Card.Text><strong>Location:</strong> {event.location} - {event.address}</Card.Text>
                <Card.Text><strong>Date:</strong> {event.startDate} to {event.endDate}</Card.Text>
                <Card.Text><strong>Time:</strong> {event.startTime} to {event.endTime}</Card.Text>
                <Card.Text><strong>Attendees:</strong> {event.attendees.length}</Card.Text>
                {event.attendees.includes(user.username) ? (
                  <Button variant="success" disabled>Joined</Button>
                ) : (
                  <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleJoinEvent(event._id); }}>Join Event</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
