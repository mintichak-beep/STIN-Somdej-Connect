import { 
  Student, Teacher, AcademicYear, Semester, Course, Section, Hospital, 
  Building, Floor, Room, RoomAssignment, Vehicle, Driver, 
  TransportSchedule, TransportAssignment, RecentActivity 
} from '../types/db';

const STORAGE_KEYS = {
  STUDENTS: 'cpatms_students',
  TEACHERS: 'cpatms_teachers',
  ACADEMIC_YEARS: 'cpatms_academic_years',
  SEMESTERS: 'cpatms_semesters',
  COURSES: 'cpatms_courses',
  SECTIONS: 'cpatms_sections',
  HOSPITALS: 'cpatms_hospitals',
  BUILDINGS: 'cpatms_buildings',
  FLOORS: 'cpatms_floors',
  ROOMS: 'cpatms_rooms',
  ROOM_ASSIGNMENTS: 'cpatms_room_assignments',
  VEHICLES: 'cpatms_vehicles',
  DRIVERS: 'cpatms_drivers',
  TRANSPORT_SCHEDULES: 'cpatms_transport_schedules',
  TRANSPORT_ASSIGNMENTS: 'cpatms_transport_assignments',
  ACTIVITIES: 'cpatms_activities'
};

// Initial realistic data
const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2568',
    year: '2568',
    name: '2568',
    startYear: '2568',
    endYear: '2569',
    description: 'Academic Year 2568 - Preparatory & Clinical Foundation',
    status: 'inactive',
    isActive: false,
    createdAt: '2025-05-10T08:00:00Z',
    updatedAt: '2025-05-10T08:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123'
  },
  {
    id: 'ay-2569',
    year: '2569',
    name: '2569',
    startYear: '2569',
    endYear: '2570',
    description: 'Academic Year 2569 - Core Clinical Placements',
    status: 'active',
    isActive: true,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123'
  },
  {
    id: 'ay-2570',
    year: '2570',
    name: '2570',
    startYear: '2570',
    endYear: '2571',
    description: 'Academic Year 2570 - Advanced Nursing Residency',
    status: 'active',
    isActive: true,
    createdAt: '2027-05-10T08:00:00Z',
    updatedAt: '2027-05-10T08:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123'
  }
];

const INITIAL_SEMESTERS: Semester[] = [
  {
    id: 'sem-2569-1',
    academicYearId: 'ay-2569',
    semesterNumber: '1',
    semesterName: 'Semester 1',
    startDate: '2026-06-01',
    endDate: '2026-10-15',
    registrationStart: '2026-05-01',
    registrationEnd: '2026-05-25',
    status: 'active',
    isCurrent: true,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'sem-2569-2',
    academicYearId: 'ay-2569',
    semesterNumber: '2',
    semesterName: 'Semester 2',
    startDate: '2026-11-01',
    endDate: '2027-03-15',
    registrationStart: '2026-10-01',
    registrationEnd: '2026-10-25',
    status: 'inactive',
    isCurrent: false,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'sem-2569-s',
    academicYearId: 'ay-2569',
    semesterNumber: 'Summer',
    semesterName: 'Summer',
    startDate: '2027-04-01',
    endDate: '2027-05-15',
    registrationStart: '2027-03-15',
    registrationEnd: '2027-03-25',
    status: 'inactive',
    isCurrent: false,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z'
  }
];

const INITIAL_COURSES: Course[] = [
  { id: 'c-ns111', code: 'NS111', name: 'Anatomy and Physiology', status: 'active' },
  { id: 'c-ns212', code: 'NS212', name: 'Adult and Gerontological Nursing', status: 'active' },
  { id: 'c-ns311', code: 'NS311', name: 'Maternal-Newborn Nursing and Midwifery I', status: 'active' },
  { id: 'c-ns411', code: 'NS411', name: 'Community Health Nursing and Primary Care', status: 'active' }
];

const INITIAL_SECTIONS: Section[] = [
  { id: 's-sec1', name: 'Section 1', courseId: 'c-ns212', status: 'active' },
  { id: 's-sec2', name: 'Section 2', courseId: 'c-ns212', status: 'active' },
  { id: 's-sec3', name: 'Section 1', courseId: 'c-ns311', status: 'active' },
  { id: 's-sec4', name: 'Section 2', courseId: 'c-ns311', status: 'active' },
  { id: 's-sec5', name: 'Section 1', courseId: 'c-ns411', status: 'active' }
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'h-siriraj',
    hospitalCode: 'H001',
    hospitalNameTH: 'โรงพยาบาลศิริราช',
    hospitalNameEN: 'Siriraj Hospital',
    shortName: 'ศิริราช',
    type: 'University Hospital',
    affiliation: 'Faculty of Medicine Siriraj Hospital, Mahidol University',
    province: 'Bangkok',
    district: 'Bangkok Noi',
    subdistrict: 'Siri Rat',
    postalCode: '10700',
    address: '2 Wang Lang Road, Siri Rat, Bangkok Noi, Bangkok 10700',
    latitude: 13.7589,
    longitude: 100.4862,
    telephone: '02-419-7000',
    fax: '02-419-7001',
    email: 'contact@siriraj.go.th',
    website: 'https://www.si.mahidol.ac.th',
    directorName: 'Prof. Apichat Asavamongkolkul',
    coordinatorName: 'Dr. Sompong (Nurse Coordinator)',
    coordinatorPhone: '081-111-2222',
    coordinatorEmail: 'sompong.siriraj@stin.ac.th',
    logoURL: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150',
    imageURL: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?auto=format&fit=crop&q=80&w=600',
    numberOfBuildings: 2,
    numberOfRooms: 6,
    studentCapacity: 40,
    teacherCapacity: 10,
    status: 'active',
    note: 'Primary teaching hospital with comprehensive medical departments.',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Siriraj Hospital',
    contactName: 'Dr. Sompong (Nurse Coordinator)',
    contactPhone: '081-111-2222',
    capacity: 40
  },
  {
    id: 'h-chula',
    hospitalCode: 'H002',
    hospitalNameTH: 'โรงพยาบาลจุฬาลงกรณ์',
    hospitalNameEN: 'King Chulalongkorn Memorial Hospital',
    shortName: 'จุฬาฯ',
    type: 'University Hospital',
    affiliation: 'Thai Red Cross Society',
    province: 'Bangkok',
    district: 'Pathum Wan',
    subdistrict: 'Pathum Wan',
    postalCode: '10330',
    address: '1862 Rama IV Road, Pathum Wan, Bangkok 10330',
    latitude: 13.7314,
    longitude: 100.5373,
    telephone: '02-256-4000',
    fax: '02-256-4001',
    email: 'info@chulalongkornhospital.go.th',
    website: 'https://chulalongkornhospital.go.th',
    directorName: 'Assoc. Prof. Chanchai Sittipunt',
    coordinatorName: 'Ajarn Darane (Head Unit)',
    coordinatorPhone: '082-222-3333',
    coordinatorEmail: 'darane.chula@stin.ac.th',
    logoURL: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150',
    imageURL: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
    numberOfBuildings: 1,
    numberOfRooms: 3,
    studentCapacity: 30,
    teacherCapacity: 8,
    status: 'active',
    note: 'Large-scale hospital managed by Thai Red Cross Society.',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'King Chulalongkorn Memorial Hospital',
    contactName: 'Ajarn Darane (Head Unit)',
    contactPhone: '082-222-3333',
    capacity: 30
  },
  {
    id: 'h-ramathibodi',
    hospitalCode: 'H003',
    hospitalNameTH: 'โรงพยาบาลรามาธิบดี',
    hospitalNameEN: 'Ramathibodi Hospital',
    shortName: 'รามาฯ',
    type: 'University Hospital',
    affiliation: 'Faculty of Medicine Ramathibodi Hospital, Mahidol University',
    province: 'Bangkok',
    district: 'Ratchathewi',
    subdistrict: 'Thung Phaya Thai',
    postalCode: '10400',
    address: '270 Rama VI Road, Thung Phaya Thai, Ratchathewi, Bangkok 10400',
    latitude: 13.7663,
    longitude: 100.5284,
    telephone: '02-201-1000',
    fax: '02-201-1001',
    email: 'rama.info@mahidol.ac.th',
    website: 'https://www.rama.mahidol.ac.th',
    directorName: 'Prof. Piyamitr Sritara',
    coordinatorName: 'Ms. Yupin Saelim',
    coordinatorPhone: '083-333-4444',
    coordinatorEmail: 'yupin.rama@stin.ac.th',
    logoURL: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150',
    imageURL: 'https://images.unsplash.com/photo-1538108176447-280586497d96?auto=format&fit=crop&q=80&w=600',
    numberOfBuildings: 1,
    numberOfRooms: 0,
    studentCapacity: 25,
    teacherCapacity: 6,
    status: 'active',
    note: 'Distinguished university hospital with focus on advanced research.',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Ramathibodi Hospital',
    contactName: 'Ms. Yupin Saelim',
    contactPhone: '083-333-4444',
    capacity: 25
  },
  {
    id: 'h-sawan',
    hospitalCode: 'H004',
    hospitalNameTH: 'โรงพยาบาลสวรรค์ประชารักษ์',
    hospitalNameEN: 'Sawanpracharak Hospital',
    shortName: 'สวรรค์ประชารักษ์',
    type: 'Regional Hospital',
    affiliation: 'Ministry of Public Health',
    province: 'Nakhon Sawan',
    district: 'Mueang Nakhon Sawan',
    subdistrict: 'Pak Nam Pho',
    postalCode: '60000',
    address: '207 Attakavee Road, Pak Nam Pho, Mueang, Nakhon Sawan 60000',
    latitude: 15.7042,
    longitude: 100.1378,
    telephone: '056-219-888',
    fax: '056-219-889',
    email: 'contact@spr.go.th',
    website: 'https://www.spr.go.th',
    directorName: 'Dr. Apichart Wimolwattanasaree',
    coordinatorName: 'Mrs. Rattana Sangkaew',
    coordinatorPhone: '056-219-888',
    coordinatorEmail: 'rattana.sawan@stin.ac.th',
    logoURL: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150',
    imageURL: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    numberOfBuildings: 1,
    numberOfRooms: 1,
    studentCapacity: 20,
    teacherCapacity: 5,
    status: 'active',
    note: 'Major regional hospital serving northern upper-central region.',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Sawanpracharak Hospital',
    contactName: 'Mrs. Rattana Sangkaew',
    contactPhone: '056-219-888',
    capacity: 20
  },
  {
    id: 'h-ratchaburi',
    hospitalCode: 'H005',
    hospitalNameTH: 'โรงพยาบาลราชบุรี',
    hospitalNameEN: 'Ratchaburi Hospital',
    shortName: 'ราชบุรี',
    type: 'Regional Hospital',
    affiliation: 'Ministry of Public Health',
    province: 'Ratchaburi',
    district: 'Mueang Ratchaburi',
    subdistrict: 'Na Mueang',
    postalCode: '70000',
    address: '85 Somboonchai Road, Na Mueang, Mueang, Ratchaburi 70000',
    latitude: 13.5286,
    longitude: 99.8134,
    telephone: '032-719-500',
    fax: '032-719-501',
    email: 'info@rajburi.go.th',
    website: 'https://www.rajburi.go.th',
    directorName: 'Dr. Anukul Thaitanan',
    coordinatorName: 'Mr. Pongsakorn',
    coordinatorPhone: '032-719-500',
    coordinatorEmail: 'pongsakorn.ratchaburi@stin.ac.th',
    logoURL: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150',
    imageURL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    numberOfBuildings: 0,
    numberOfRooms: 0,
    studentCapacity: 15,
    teacherCapacity: 4,
    status: 'active',
    note: 'Regional hospital specializing in patient care and nursing training.',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Ratchaburi Hospital',
    contactName: 'Mr. Pongsakorn',
    contactPhone: '032-719-500',
    capacity: 15
  }
];

const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'b-dormA',
    hospitalId: 'h-siriraj',
    buildingCode: 'BLDG-001',
    buildingName: 'STIN Main Dormitory A',
    buildingType: 'Dormitory',
    numberOfFloors: 3,
    totalRooms: 6,
    totalBeds: 22,
    gender: 'Female',
    address: 'Siriraj Hospital Campus, Bangkok',
    description: 'Primary female nursing student residence with standard facilities.',
    imageURL: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'STIN Main Dormitory A',
    capacity: 22
  },
  {
    id: 'b-dormB',
    hospitalId: 'h-siriraj',
    buildingCode: 'BLDG-002',
    buildingName: 'STIN Annex Dormitory B',
    buildingType: 'Residence',
    numberOfFloors: 2,
    totalRooms: 3,
    totalBeds: 12,
    gender: 'Male',
    address: 'Siriraj Hospital Campus West Gate, Bangkok',
    description: 'Annex building dedicated for male students or overflow clinical trainees.',
    imageURL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'STIN Annex Dormitory B',
    capacity: 12
  },
  {
    id: 'b-chulaRes',
    hospitalId: 'h-chula',
    buildingCode: 'BLDG-003',
    buildingName: 'Chula Nurses Residence',
    buildingType: 'Apartment',
    numberOfFloors: 4,
    totalRooms: 3,
    totalBeds: 10,
    gender: 'Mixed',
    address: 'King Chulalongkorn Memorial Hospital Campus, Bangkok',
    description: 'Mixed dormitory for clinical practice nursing students.',
    imageURL: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Chula Nurses Residence',
    capacity: 10
  },
  {
    id: 'b-ramaStaff',
    hospitalId: 'h-ramathibodi',
    buildingCode: 'BLDG-004',
    buildingName: 'Ramathibodi Student Apartments',
    buildingType: 'Residence',
    numberOfFloors: 5,
    totalRooms: 2,
    totalBeds: 8,
    gender: 'Female',
    address: 'Ratchathewi, Bangkok',
    description: 'Comfortable apartments providing easy walking access to Ramathibodi Hospital.',
    imageURL: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Ramathibodi Student Apartments',
    capacity: 8
  },
  {
    id: 'b-sawanRes',
    hospitalId: 'h-sawan',
    buildingCode: 'BLDG-005',
    buildingName: 'Sawanpracharak Dormitory',
    buildingType: 'Guest House',
    numberOfFloors: 2,
    totalRooms: 1,
    totalBeds: 4,
    gender: 'Mixed',
    address: 'Mueang Nakhon Sawan, Nakhon Sawan',
    description: 'Shared residence for regional clinical rotation teams.',
    imageURL: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-07-16T12:00:00Z',
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
    name: 'Sawanpracharak Dormitory',
    capacity: 4
  }
];

const INITIAL_FLOORS: Floor[] = [
  // b-dormA
  { id: 'f-dormA-1', hospitalId: 'h-siriraj', buildingId: 'b-dormA', floorNumber: 1, floorName: '1st Floor', totalRooms: 4, totalBeds: 14, description: 'Ground floor with reception and shared areas', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' },
  { id: 'f-dormA-2', hospitalId: 'h-siriraj', buildingId: 'b-dormA', floorNumber: 2, floorName: '2nd Floor', totalRooms: 2, totalBeds: 8, description: 'Standard female student rooms', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' },
  // b-dormB
  { id: 'f-dormB-1', hospitalId: 'h-siriraj', buildingId: 'b-dormB', floorNumber: 1, floorName: '1st Floor', totalRooms: 3, totalBeds: 12, description: 'Annex ground floor rooms', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' },
  // b-chulaRes
  { id: 'f-chulaRes-1', hospitalId: 'h-chula', buildingId: 'b-chulaRes', floorNumber: 1, floorName: '1st Floor', totalRooms: 3, totalBeds: 10, description: 'Chula residence ground floor', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' },
  // b-ramaStaff
  { id: 'f-ramaStaff-1', hospitalId: 'h-ramathibodi', buildingId: 'b-ramaStaff', floorNumber: 1, floorName: '1st Floor', totalRooms: 2, totalBeds: 8, description: 'Rama apartments ground floor', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' },
  // b-sawanRes
  { id: 'f-sawanRes-1', hospitalId: 'h-sawan', buildingId: 'b-sawanRes', floorNumber: 1, floorName: '1st Floor', totalRooms: 1, totalBeds: 4, description: 'Sawan ground floor rooms', status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', createdBy: 'admin-123', updatedBy: 'admin-123' }
];

const INITIAL_ROOMS: Room[] = [
  // Siriraj Main Dormitory A
  { id: 'r-dormA-101', roomNumber: '101', buildingId: 'b-dormA', floorId: 'f-dormA-1', gender: 'Female', capacity: 4, occupiedCount: 4, status: 'full' },
  { id: 'r-dormA-102', roomNumber: '102', buildingId: 'b-dormA', floorId: 'f-dormA-1', gender: 'Female', capacity: 4, occupiedCount: 3, status: 'active' },
  { id: 'r-dormA-103', roomNumber: '103', buildingId: 'b-dormA', floorId: 'f-dormA-1', gender: 'Female', capacity: 4, occupiedCount: 0, status: 'active' },
  { id: 'r-dormA-104', roomNumber: '104', buildingId: 'b-dormA', floorId: 'f-dormA-1', gender: 'Female', capacity: 2, occupiedCount: 1, status: 'active' },
  { id: 'r-dormA-201', roomNumber: '201', buildingId: 'b-dormA', floorId: 'f-dormA-2', gender: 'Female', capacity: 4, occupiedCount: 4, status: 'full' },
  { id: 'r-dormA-202', roomNumber: '202', buildingId: 'b-dormA', floorId: 'f-dormA-2', gender: 'Female', capacity: 4, occupiedCount: 0, status: 'maintenance' },
  
  // Chula Nurses Residence
  { id: 'r-chula-101', roomNumber: 'A-301', buildingId: 'b-chulaRes', floorId: 'f-chulaRes-1', gender: 'Mixed', capacity: 4, occupiedCount: 2, status: 'active' },
  { id: 'r-chula-102', roomNumber: 'A-302', buildingId: 'b-chulaRes', floorId: 'f-chulaRes-1', gender: 'Mixed', capacity: 4, occupiedCount: 4, status: 'full' },
  { id: 'r-chula-103', roomNumber: 'A-303', buildingId: 'b-chulaRes', floorId: 'f-chulaRes-1', gender: 'Mixed', capacity: 2, occupiedCount: 0, status: 'active' },

  // Sawanpracharak
  { id: 'r-sawan-101', roomNumber: 'SP-101', buildingId: 'b-sawanRes', floorId: 'f-sawanRes-1', gender: 'Mixed', capacity: 4, occupiedCount: 2, status: 'active' }
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v-van01', plateNumber: '3กค-4567', model: 'Toyota Commuter (White)', capacity: 14, status: 'active' },
  { id: 'v-van02', plateNumber: '7กศ-1212', model: 'Toyota Commuter (Silver)', capacity: 14, status: 'active' },
  { id: 'v-van03', plateNumber: '9กฬ-9900', model: 'Nissan Urvan (Grey)', capacity: 12, status: 'maintenance' },
  { id: 'v-bus01', plateNumber: '40-1234', model: 'STIN Shuttle Bus', capacity: 40, status: 'active' }
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'd-somchai', name: 'Mr. Somchai Sookjai', phone: '081-345-6789', licenseNumber: 'DL-994821', status: 'active' },
  { id: 'd-wichai', name: 'Mr. Wichai Rakdee', phone: '082-987-6543', licenseNumber: 'DL-883921', status: 'active' },
  { id: 'd-sombat', name: 'Mr. Sombat Jaidee', phone: '083-445-5667', licenseNumber: 'DL-110294', status: 'active' }
];

const INITIAL_TRANSPORT_SCHEDULES: TransportSchedule[] = [
  { id: 'ts-01', vehicleId: 'v-van01', driverId: 'd-somchai', route: 'STIN Campus ⇄ Siriraj Hospital', departureTime: '06:30', status: 'scheduled' },
  { id: 'ts-02', vehicleId: 'v-van02', driverId: 'd-wichai', route: 'STIN Campus ⇄ Chulalongkorn Hospital', departureTime: '06:45', status: 'scheduled' },
  { id: 'ts-03', vehicleId: 'v-bus01', driverId: 'd-sombat', route: 'STIN Campus ⇄ Ramathibodi Hospital', departureTime: '07:00', status: 'scheduled' },
  { id: 'ts-04', vehicleId: 'v-van01', driverId: 'd-somchai', route: 'STIN Campus ⇄ Sawanpracharak Hospital', departureTime: '05:30', status: 'completed' }
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: 't-1', teacherId: 'T001', name: 'Ajarn Somsri Saeli', email: 'somsri@stin.ac.th', phone: '081-445-5661', department: 'Fundamental Nursing', courseIds: ['c-ns111', 'c-ns212'], status: 'active' },
  { id: 't-2', teacherId: 'T002', name: 'Dr. Malee Prasert', email: 'malee@stin.ac.th', phone: '082-556-6772', department: 'Obstetric Nursing', courseIds: ['c-ns311'], status: 'active' },
  { id: 't-3', teacherId: 'T003', name: 'Ajarn Kitti Wongsawat', email: 'kitti@stin.ac.th', phone: '083-667-7883', department: 'Community Nursing', courseIds: ['c-ns411'], status: 'active' },
  { id: 't-4', teacherId: 'T004', name: 'Dr. Nattaporn Siri', email: 'nattaporn@stin.ac.th', phone: '084-778-8994', department: 'Adult Nursing & Surgery', courseIds: ['c-ns212'], status: 'active' },
  { id: 't-5', teacherId: 'T005', name: 'Ajarn Piyanut Boonsong', email: 'piyanut@stin.ac.th', phone: '085-889-9005', department: 'Pediatric Nursing', courseIds: ['c-ns311', 'c-ns411'], status: 'inactive' }
];

const INITIAL_STUDENTS: Student[] = [
  { 
    id: 'st-1', 
    studentId: '1', 
    studentNumber: 'S6601001', 
    studentName: 'Miss Apisara Rakdee', 
    section: '1', 
    academicYear: '2569', 
    hospital: 'Siriraj Hospital', 
    rotationGroup: 'A1', 
    DRSchedule: '08:00 - 16:00',
    roomId: 'r-dormA-101', 
    bedId: 'b-1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin-123',
    updatedBy: 'admin-123'
  }
];

const INITIAL_ROOM_ASSIGNMENTS: RoomAssignment[] = [
  { id: 'ra-01', roomId: 'r-dormA-101', studentId: 'st-1', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-02', roomId: 'r-dormA-101', studentId: 'st-2', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-03', roomId: 'r-dormA-101', studentId: 'st-3', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-04', roomId: 'r-dormA-101', studentId: 'st-4', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-05', roomId: 'r-chula-101', studentId: 'st-5', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-06', roomId: 'r-chula-101', studentId: 'st-6', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-07', roomId: 'r-chula-102', studentId: 'st-7', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' },
  { id: 'ra-08', roomId: 'r-sawan-101', studentId: 'st-10', academicYearId: 'ay-2569', semester: '1', startDate: '2026-06-01', endDate: '2026-10-31', status: 'active' }
];

const INITIAL_TRANSPORT_ASSIGNMENTS: TransportAssignment[] = [
  { id: 'ta-01', scheduleId: 'ts-01', studentId: 'st-1', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Siriraj ER Ward', status: 'active' },
  { id: 'ta-02', scheduleId: 'ts-01', studentId: 'st-2', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Siriraj ER Ward', status: 'active' },
  { id: 'ta-03', scheduleId: 'ts-01', studentId: 'st-3', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Siriraj ER Ward', status: 'active' },
  { id: 'ta-04', scheduleId: 'ts-01', studentId: 'st-4', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Siriraj ER Ward', status: 'active' },
  { id: 'ta-05', scheduleId: 'ts-02', studentId: 'st-5', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Chulalongkorn Building 14', status: 'active' },
  { id: 'ta-06', scheduleId: 'ts-02', studentId: 'st-6', pickupLocation: 'STIN Campus Residence', dropoffLocation: 'Chulalongkorn Building 14', status: 'active' }
];

const INITIAL_ACTIVITIES: RecentActivity[] = [
  { id: 'act-1', type: 'login', title: 'Administrator Login', description: 'STIN Administrator signed in from IP 192.168.1.104', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, // 5 mins ago
  { id: 'act-2', type: 'student_add', title: 'New Student Registered', description: 'Mr. Jaturon Kaewmanee (S6601010) registered for Sawanpracharak Hospital', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() }, // 45 mins ago
  { id: 'act-3', type: 'teacher_add', title: 'Teacher Profile Added', description: 'Dr. Nattaporn Siri added to Adult Nursing department', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }, // 2 hours ago
  { id: 'act-4', type: 'room_assign', title: 'Dorm Room Assigned', description: 'Assigned Room 101 in Dormitory A to Miss Apisara Rakdee', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
  { id: 'act-5', type: 'transport_assign', title: 'Transportation Assigned', description: 'Assigned Miss Apisara Rakdee to STIN Campus ⇄ Siriraj shuttle', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 250).toISOString() },
  { id: 'act-6', type: 'report_gen', title: 'Placement Performance Report', description: 'Generated monthly summary of clinical placements for Academic Year 2569 Semester 1', userId: 'admin-123', userDisplayName: 'STIN Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() }
];

// Load and retrieve localStorage helper with fallback and event notifier
function loadData<T>(key: string, fallback: T[]): T[] {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(item);
}

function saveData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch a global custom event for reactive, real-time Firestore-like listener behavior
  window.dispatchEvent(new CustomEvent('cpatms_db_update', { detail: { key } }));
}

export const mockDB = {
  getStudents: (): Student[] => loadData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (data: Student[]) => saveData(STORAGE_KEYS.STUDENTS, data),
  
  getTeachers: (): Teacher[] => loadData(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeachers: (data: Teacher[]) => saveData(STORAGE_KEYS.TEACHERS, data),
  
  getAcademicYears: (): AcademicYear[] => loadData(STORAGE_KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS),
  saveAcademicYears: (data: AcademicYear[]) => saveData(STORAGE_KEYS.ACADEMIC_YEARS, data),
  
  getSemesters: (): Semester[] => loadData(STORAGE_KEYS.SEMESTERS, INITIAL_SEMESTERS),
  saveSemesters: (data: Semester[]) => saveData(STORAGE_KEYS.SEMESTERS, data),
  
  getCourses: (): Course[] => loadData(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  saveCourses: (data: Course[]) => saveData(STORAGE_KEYS.COURSES, data),
  
  getSections: (): Section[] => loadData(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS),
  saveSections: (data: Section[]) => saveData(STORAGE_KEYS.SECTIONS, data),
  
  getHospitals: (): Hospital[] => loadData(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS),
  saveHospitals: (data: Hospital[]) => saveData(STORAGE_KEYS.HOSPITALS, data),
  
  getBuildings: (): Building[] => loadData(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS),
  saveBuildings: (data: Building[]) => saveData(STORAGE_KEYS.BUILDINGS, data),

  getFloors: (): Floor[] => loadData(STORAGE_KEYS.FLOORS, INITIAL_FLOORS),
  saveFloors: (data: Floor[]) => saveData(STORAGE_KEYS.FLOORS, data),
  
  getRooms: (): Room[] => loadData(STORAGE_KEYS.ROOMS, INITIAL_ROOMS),
  saveRooms: (data: Room[]) => saveData(STORAGE_KEYS.ROOMS, data),
  
  getRoomAssignments: (): RoomAssignment[] => loadData(STORAGE_KEYS.ROOM_ASSIGNMENTS, INITIAL_ROOM_ASSIGNMENTS),
  saveRoomAssignments: (data: RoomAssignment[]) => saveData(STORAGE_KEYS.ROOM_ASSIGNMENTS, data),
  
  getVehicles: (): Vehicle[] => loadData(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES),
  saveVehicles: (data: Vehicle[]) => saveData(STORAGE_KEYS.VEHICLES, data),
  
  getDrivers: (): Driver[] => loadData(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS),
  saveDrivers: (data: Driver[]) => saveData(STORAGE_KEYS.DRIVERS, data),
  
  getTransportSchedules: (): TransportSchedule[] => loadData(STORAGE_KEYS.TRANSPORT_SCHEDULES, INITIAL_TRANSPORT_SCHEDULES),
  saveTransportSchedules: (data: TransportSchedule[]) => saveData(STORAGE_KEYS.TRANSPORT_SCHEDULES, data),
  
  getTransportAssignments: (): TransportAssignment[] => loadData(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS, INITIAL_TRANSPORT_ASSIGNMENTS),
  saveTransportAssignments: (data: TransportAssignment[]) => saveData(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS, data),
  
  getActivities: (): RecentActivity[] => loadData(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES),
  saveActivities: (data: RecentActivity[]) => saveData(STORAGE_KEYS.ACTIVITIES, data),

  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
    const list = loadData(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    const newAct: RecentActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newAct);
    saveData(STORAGE_KEYS.ACTIVITIES, list.slice(0, 50)); // Keep last 50
  }
};
