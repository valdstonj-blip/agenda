
export interface Meeting {
  id: string;
  dateTime: string;
  subject: string;
  officer: string;
  location: string;
  notes: string;
  isDeleted: boolean;
}

export type NewMeetingData = Omit<Meeting, 'id' | 'isDeleted'>;

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface GoogleSheetsSettings {
  scriptUrl: string;
}

export interface GoogleSheetsContextType {
  settings: GoogleSheetsSettings;
  toasts: ToastMessage[];
  saveSettings: (newSettings: GoogleSheetsSettings) => void;
  appendMeeting: (meeting: Meeting) => Promise<void>;
  addToast: (message: string, type: 'success' | 'error') => void;
}