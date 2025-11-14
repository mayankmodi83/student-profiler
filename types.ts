
export interface Student {
  id: number;
  name: string;
  address: string;
  birthdate: string; // Stored as a string like "YYYY-MM-DD"
  age: number; // Calculated from birthdate
  familybackground: string;
  photo: string;
  trade: string;
  center: string;
  socioeconomicstatus: string;
  education: string;
  trainingduration: string;
  trainingfees: string;
}

export interface GeneratedProfile extends Student {
  profileText: string;
}
