import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Props {
  room: any;
  students: any[];
}

export function RoomCard({ room, students }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6">Room {room.roomNumber}</Typography>
        <Typography color="textSecondary">Capacity: {students.length}/{room.capacity}</Typography>
        <Typography color="textSecondary">Period: {students[0]?.accommodationPeriod || '-'}</Typography>
        <List dense>
          {students.map((s, idx) => (
            <ListItem key={s.id}>
              <ListItemText primary={`${idx + 1}. ${s.studentName}`} secondary={s.studentNumber} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
