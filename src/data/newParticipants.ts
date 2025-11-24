// New participant dataset
// All participants will automatically be enabled for ALL events.

export interface NewParticipant {
  name: string;
  faculty: string; 
  alias?: string;
}

export const newParticipants: NewParticipant[] = [
  // FMF
  { name: 'T.H. Senura Sasmitha', faculty: 'FMF', alias: 'Senura' },
  { name: 'D. G. Tharusha Pasan', faculty: 'FMF', alias: 'Pasan' },
  { name: 'A. Vijan Nethmuthu Theannkon', faculty: 'FMF', alias: 'Vijan' },
  { name: 'I. A. Yasen Sithira', faculty: 'FMF', alias: 'Yasen' },
  { name: 'L. S. Siribaddhana', faculty: 'FMF', alias: 'Lasal' },

  // FOS
  { name: 'W.A. Dasun Thathsara Gunawardana', faculty: 'FOS', alias: 'Dasun' },
  { name: 'Poorna Mindula Ramanayaka', faculty: 'FOS', alias: 'Poorna' },
  { name: 'P.D.N. Manith Jayasankha', faculty: 'FOS', alias: 'Manith' },
  { name: 'R.M. Maleesha Nimantha Rathnayake', faculty: 'FOS', alias: 'Maleesha' },

  // UCFM
  { name: 'Chamuditha M.V.J', faculty: 'UCFM', alias: 'Janith' },
  { name: 'J.K. Lokuge', faculty: 'UCFM', alias: 'Jahn' },
  { name: 'M.A.D. Nirmarn Sandapawan Anawarat', faculty: 'UCFM', alias: 'Nirman' },
  { name: 'W.D.R. Gaynatha', faculty: 'UCFM', alias: 'Gayantha' },

  // FON
  { name: 'A. Sharanram', faculty: 'FON', alias: 'Sharanram' },
  { name: 'I.A. Ahamed', faculty: 'FON', alias: 'Afrih' },
  { name: 'S. Arunprasenth', faculty: 'FON', alias: 'Arun' },
  { name: 'H.P.S. Madumal', faculty: 'FON', alias: 'Sahan' },

  // UCSC
  { name: 'B. Arshad', faculty: 'UCSC', alias: 'Arshad' },
  { name: 'W.A.S.V. Wickramasinghe', faculty: 'UCSC', alias: 'Sasmitha' },
  { name: 'M.N.L.O. Themiya', faculty: 'UCSC', alias: 'Odhi' },
  { name: 'S.G.M.S. Indunu', faculty: 'UCSC', alias: 'Sachala' },

  // FOT
  { name: 'K.M.P. Bandara', faculty: 'FOT', alias: 'Adiptha' },
  { name: 'K.M.G. Maduranga', faculty: 'FOT', alias: 'Petesh' },
  { name: 'D.M. Kumarasignha', faculty: 'FOT', alias: 'Disala' },
  { name: 'H.M.K. Mihiranga', faculty: 'FOT', alias: 'Kalindu' },
  { name: 'H.A.M.D. Aththanayake', faculty: 'FOT', alias: 'Dimantha' },
];
