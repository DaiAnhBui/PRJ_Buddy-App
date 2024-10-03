// pages/events/create.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button } from 'react-bootstrap';

export default function CreateEvent({ user }) {

  const apiUrl = process.env.NEXT_PUBLIC_EVENT_API_URL;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendees, setAttendees] = useState('anyone');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('address', address);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);
      formData.append('attendees', attendees);
      formData.append('organizer', user.username);
      formData.append('image', image);

      const response = await fetch(`${apiUrl}/api/events`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        router.push('/events');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Create a new event</h2>
      <Form onSubmit={handleCreateEvent}>
        <Form.Group controlId="eventTitle">
          <Form.Label>Event Title</Form.Label>
          <Form.Control type="text" placeholder="Enter event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventDescription" className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter event description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventLocation" className="mt-3">
          <Form.Label>Location</Form.Label>
          <Form.Control type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventAddress" className="mt-3">
          <Form.Label>Address</Form.Label>
          <Form.Control type="text" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventStartDate" className="mt-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventEndDate" className="mt-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventStartTime" className="mt-3">
          <Form.Label>Start Time</Form.Label>
          <Form.Control type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventEndTime" className="mt-3">
          <Form.Label>End Time</Form.Label>
          <Form.Control type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="eventAttendees" className="mt-3">
          <Form.Label>Who can join this event?</Form.Label>
          <Form.Check type="radio" label="Anyone" value="anyone" checked={attendees === 'anyone'} onChange={() => setAttendees('anyone')} />
          <Form.Check type="radio" label="Only people I invite" value="invite" checked={attendees === 'invite'} onChange={() => setAttendees('invite')} />
        </Form.Group>

        <Form.Group controlId="eventImage" className="mt-3">
          <Form.Label>Event Image</Form.Label>
          <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">Create Event</Button>
        {message && <p className="mt-3">{message}</p>}
      </Form>
    </Container>
  );
}
