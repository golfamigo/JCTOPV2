import { Event } from '@jctop-event/shared-types';

export class EventResponseDto implements Event {
  id: string;
  organizerId: string;
  categoryId: string;
  venueId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;

  constructor(event: Event) {
    this.id = event.id;
    this.organizerId = event.organizerId;
    this.categoryId = event.categoryId;
    this.venueId = event.venueId;
    this.title = event.title;
    this.description = event.description;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.location = event.location;
    this.status = event.status;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}