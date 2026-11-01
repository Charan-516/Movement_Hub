export type Volunteer = {
  id?: number;
  name: string;
  locationOrDepartment: string;
};

export type EventItem = {
  id: number;
  title: string;
  date: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  volunteerCapacity: number;
  volunteers?: Volunteer[];
  createdByAdmin?: {
    fullName?: string | null;
    email: string;
  } | null;

  adminAssignments?: {
    admin: {
      fullName?: string | null;
      email: string;
    };
  }[];
};