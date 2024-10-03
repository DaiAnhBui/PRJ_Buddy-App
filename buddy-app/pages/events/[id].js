// pages/events/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Row, Col, ListGroup, Form, Card } from 'react-bootstrap';

export default function EventDetail({ user }) {

    const apiUrl = process.env.NEXT_PUBLIC_EVENT_API_URL;

    const router = useRouter();
    const { id } = router.query;
    const [event, setEvent] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
  
    useEffect(() => {
      if (id) {
        fetch(`${apiUrl}/api/events/${id}`)
          .then(response => response.json())
          .then(data => {
            if (data.event) {
              setEvent(data.event);
            } else {
              setEvent(null);
            }
          })
          .catch(error => console.error('Error fetching event:', error));
  
        fetch(`${apiUrl}/api/events/${id}/comments`)
          .then(response => response.json())
          .then(data => setComments(data.comments))
          .catch(error => console.error('Error fetching comments:', error));
      }
    }, [id]);
  
    const handleJoinEvent = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/events/${id}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: user.username }),
        });
        if (response.ok) {
          const updatedEvent = await response.json();
          setEvent(updatedEvent.event);
        } else {
          console.error('Error joining event');
        }
      } catch (error) {
        console.error('Error joining event:', error);
      }
    };
  
    const handleLeaveEvent = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/events/${id}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: user.username }),
        });
        if (response.ok) {
          const updatedEvent = await response.json();
          setEvent(updatedEvent.event);
        } else {
          console.error('Error leaving event');
        }
      } catch (error) {
        console.error('Error leaving event:', error);
      }
    };
  
    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!commentText) return;
  
      try {
        const response = await fetch(`${apiUrl}/api/events/${id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: user.username, text: commentText }),
        });
  
        if (response.ok) {
          setComments([...comments, { user: user.username, text: commentText }]);
          setCommentText('');
        } else {
          console.error('Error adding comment');
        }
      } catch (error) {
        console.error('Error adding comment', error);
      }
    };
  
    const handleCancelEvent = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: user.username }),
        });
        if (response.ok) {
          router.push('/events');
        } else {
          const data = await response.json();
          console.error('Error canceling event:', data.message);
        }
      } catch (error) {
        console.error('Error canceling event:', error);
      }
    };
  
    if (!event) {
      return <div>Loading...</div>;
    }
  
    return (
      <Container className="mt-4">
      <Card className="mb-4">
        {event.imageUrl && <Card.Img variant="top" src={event.imageUrl} />}
        <Card.Body>
          <Card.Title>{event.title}</Card.Title>
          <Card.Text>{event.description}</Card.Text>
          <Row className="mb-3">
            <Col md={6}>
              <Card.Text><strong>Location:</strong> {event.location}</Card.Text>
              <Card.Text><strong>Address:</strong> {event.address}</Card.Text>
            </Col>
            <Col md={6}>
              <Card.Text><strong>Start Date:</strong> {event.startDate}</Card.Text>
              <Card.Text><strong>End Date:</strong> {event.endDate}</Card.Text>
              <Card.Text><strong>Start Time:</strong> {event.startTime}</Card.Text>
              <Card.Text><strong>End Time:</strong> {event.endTime}</Card.Text>
            </Col>
          </Row>
          <Card.Text><strong>Organizer:</strong> {event.organizer}</Card.Text>
          <Card.Text><strong>Attendees:</strong> {event.attendees.length}</Card.Text>
          <ListGroup className="mb-3">
            {event.attendees.map((attendee, index) => (
              <ListGroup.Item key={index}>{attendee}</ListGroup.Item>
            ))}
          </ListGroup>
          {event.attendees.includes(user.username) ? (
            <Button variant="danger" onClick={handleLeaveEvent}>Leave Event</Button>
          ) : (
            <Button variant="primary" onClick={handleJoinEvent}>Join Event</Button>
          )}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h3>Comments</h3>
          <Form onSubmit={handleAddComment} className="mb-4">
            <Form.Group controlId="commentText">
              <Form.Label>Add a comment</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">Add Comment</Button>
          </Form>
          <ListGroup>
            {comments.map((comment, index) => (
              <ListGroup.Item key={index}>
                <strong>{comment.user}</strong>: {comment.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
      {event.organizer === user.username && (
        <Button variant="danger" onClick={handleCancelEvent} className="mt-4">Cancel Event</Button>
      )}
    </Container>
    );
  }
  