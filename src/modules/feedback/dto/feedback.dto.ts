export class CreateFeedbackDto {
  title: string;
  description: string;
  roomId: string;
  images?: string[];
}

export class UpdateFeedbackDto {
  status?: string;
  images?: string[];
  title?: string;
  description?: string;
}