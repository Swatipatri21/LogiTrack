// Mock data for demo mode (no backend required)

export const MOCK_SHIPMENTS = [
  {
    id: 1, trackingId: 'TRK-PUNE2MUM1',
    senderName: 'Rajesh Kumar', senderAddress: '12 Koregaon Park, Pune 411001',
    receiverName: 'Priya Sharma', receiverAddress: '45 Bandra West, Mumbai 400050',
    receiverPhone: '+91 98001 11111', receiverEmail: 'priya@example.com',
    origin: 'Pune', destination: 'Mumbai', weight: 3.5, description: 'Electronics',
    currentStatus: 'IN_TRANSIT', isDelayed: false, delayReason: null,
    expectedDeliveryDate: '2025-09-02T14:00:00', revisedDeliveryDate: null,
    estimatedDaysMessage: 'Expected tomorrow',
    createdByEmail: 'admin@logitrack.com', createdAt: '2025-09-01T09:00:00', updatedAt: '2025-09-01T11:30:00',
    originLat: 18.5204, originLng: 73.8567, destinationLat: 19.0760, destinationLng: 72.8777,
  },
  {
    id: 2, trackingId: 'TRK-DEL2BLR01',
    senderName: 'Sunita Desai', senderAddress: '78 Connaught Place, New Delhi 110001',
    receiverName: 'Arun Nair', receiverAddress: '23 Indiranagar, Bengaluru 560038',
    receiverPhone: '+91 98002 22222', receiverEmail: 'arun@example.com',
    origin: 'New Delhi', destination: 'Bengaluru', weight: 1.2, description: 'Documents',
    currentStatus: 'DELIVERED', isDelayed: false, delayReason: null,
    expectedDeliveryDate: '2025-08-31T16:00:00', revisedDeliveryDate: null,
    estimatedDaysMessage: 'Delivered',
    createdByEmail: 'admin@logitrack.com', createdAt: '2025-08-28T10:00:00', updatedAt: '2025-08-31T15:45:00',
    originLat: 28.6139, originLng: 77.2090, destinationLat: 12.9716, destinationLng: 77.5946,
  },
  {
    id: 3, trackingId: 'TRK-MUM2CHN01',
    senderName: 'Vivek Patil', senderAddress: '5 Marine Drive, Mumbai 400002',
    receiverName: 'Anjali Mehta', receiverAddress: '67 Anna Nagar, Chennai 600040',
    receiverPhone: '+91 98003 33333', receiverEmail: 'anjali@example.com',
    origin: 'Mumbai', destination: 'Chennai', weight: 8.0, description: 'Clothing',
    currentStatus: 'OUT_FOR_DELIVERY', isDelayed: true, delayReason: 'Traffic congestion at Nagpur hub',
    expectedDeliveryDate: '2025-09-01T18:00:00', revisedDeliveryDate: '2025-09-02T12:00:00',
    estimatedDaysMessage: 'Delayed — expected tomorrow',
    createdByEmail: 'admin@logitrack.com', createdAt: '2025-08-30T08:00:00', updatedAt: '2025-09-01T10:00:00',
    originLat: 19.0760, originLng: 72.8777, destinationLat: 13.0827, destinationLng: 80.2707,
  },
  {
    id: 4, trackingId: 'TRK-KOL2HYD01',
    senderName: 'Kiran Joshi', senderAddress: '34 Park Street, Kolkata 700016',
    receiverName: 'Deepak Reddy', receiverAddress: '12 Jubilee Hills, Hyderabad 500033',
    receiverPhone: '+91 98004 44444', receiverEmail: 'deepak@example.com',
    origin: 'Kolkata', destination: 'Hyderabad', weight: 5.5, description: 'Medical Supplies',
    currentStatus: 'CREATED', isDelayed: false, delayReason: null,
    expectedDeliveryDate: '2025-09-05T10:00:00', revisedDeliveryDate: null,
    estimatedDaysMessage: 'Expected in 4 days',
    createdByEmail: 'admin@logitrack.com', createdAt: '2025-09-01T14:00:00', updatedAt: '2025-09-01T14:00:00',
    originLat: 22.5726, originLng: 88.3639, destinationLat: 17.3850, destinationLng: 78.4867,
  },
  {
    id: 5, trackingId: 'TRK-AHM2LKO01',
    senderName: 'Meera Iyer', senderAddress: '56 CG Road, Ahmedabad 380009',
    receiverName: 'Suresh Pillai', receiverAddress: '89 Hazratganj, Lucknow 226001',
    receiverPhone: '+91 98005 55555', receiverEmail: 'suresh@example.com',
    origin: 'Ahmedabad', destination: 'Lucknow', weight: 2.0, description: 'Books',
    currentStatus: 'DELIVERY_ATTEMPTED', isDelayed: true, delayReason: 'Customer not available at address',
    expectedDeliveryDate: '2025-09-01T14:00:00', revisedDeliveryDate: '2025-09-02T10:00:00',
    estimatedDaysMessage: 'Delayed — arriving today',
    createdByEmail: 'staff@logitrack.com', createdAt: '2025-08-30T09:00:00', updatedAt: '2025-09-01T13:00:00',
    originLat: 23.0225, originLng: 72.5714, destinationLat: 26.8467, destinationLng: 80.9462,
  },
  {
    id: 6, trackingId: 'TRK-JAI2KOC01',
    senderName: 'Pooja Rao', senderAddress: '78 Tonk Road, Jaipur 302015',
    receiverName: 'Rahul Gupta', receiverAddress: '34 MG Road, Kochi 682016',
    receiverPhone: '+91 98006 66666', receiverEmail: 'rahul@example.com',
    origin: 'Jaipur', destination: 'Kochi', weight: 12.0, description: 'Furniture Parts',
    currentStatus: 'DISPATCHED', isDelayed: false, delayReason: null,
    expectedDeliveryDate: '2025-09-06T10:00:00', revisedDeliveryDate: null,
    estimatedDaysMessage: 'Expected in 5 days',
    createdByEmail: 'admin@logitrack.com', createdAt: '2025-09-01T16:00:00', updatedAt: '2025-09-01T16:30:00',
    originLat: 26.9124, originLng: 75.7873, destinationLat: 9.9312, destinationLng: 76.2673,
  },
];

export const MOCK_HISTORY = [
  { id:1, trackingId:'TRK-PUNE2MUM1', action:'SHIPMENT_CREATED', performedBy:'admin@logitrack.com', timestamp:'2025-09-01T09:00:00', details:'Shipment created with 2 routing steps. Expected: 2025-09-02T14:00:00' },
  { id:2, trackingId:'TRK-PUNE2MUM1', action:'HUB_STEP_UPDATED', performedBy:'staff@logitrack.com', timestamp:'2025-09-01T11:30:00', details:'Pune Hub — step marked ARRIVED' },
  { id:3, trackingId:'TRK-DEL2BLR01', action:'SHIPMENT_CREATED', performedBy:'admin@logitrack.com', timestamp:'2025-08-28T10:00:00', details:'Shipment created with 4 routing steps' },
  { id:4, trackingId:'TRK-DEL2BLR01', action:'DELIVERED', performedBy:'staff@logitrack.com', timestamp:'2025-08-31T15:45:00', details:'OTP verified. Delivered by Staff Member' },
  { id:5, trackingId:'TRK-MUM2CHN01', action:'DELAY_REPORTED', performedBy:'hub.pune@logitrack.com', timestamp:'2025-09-01T10:00:00', details:'Delivery delayed by 18 hours. Reason: Traffic congestion at Nagpur hub' },
  { id:6, trackingId:'TRK-KOL2HYD01', action:'SHIPMENT_CREATED', performedBy:'admin@logitrack.com', timestamp:'2025-09-01T14:00:00', details:'Shipment created with 3 routing steps' },
  { id:7, trackingId:'TRK-AHM2LKO01', action:'DELIVERY_ATTEMPTED', performedBy:'staff@logitrack.com', timestamp:'2025-09-01T13:00:00', details:'Customer not available at address. Rescheduled.' },
];

export const MOCK_TIMELINES = {
  'TRK-PUNE2MUM1': [
    { status:'CREATED', remarks:'Shipment registered. Package to be picked up from Rajesh Kumar.', location:'Pune', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-09-01T09:00:00' },
    { status:'DISPATCHED', remarks:'Package picked up from sender — heading to Pune Hub.', location:'12 Koregaon Park, Pune', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-09-01T09:05:00' },
    { status:'IN_TRANSIT', remarks:'Arrived at Pune Hub. Processing for dispatch to Mumbai.', location:'Pune Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-09-01T11:30:00' },
  ],
  'TRK-DEL2BLR01': [
    { status:'CREATED', remarks:'Shipment registered.', location:'New Delhi', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-08-28T10:00:00' },
    { status:'DISPATCHED', remarks:'Picked up from sender.', location:'Connaught Place, Delhi', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-08-28T10:05:00' },
    { status:'IN_TRANSIT', remarks:'Arrived at Delhi Hub', location:'Delhi Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-28T14:00:00' },
    { status:'IN_TRANSIT', remarks:'Dispatched via Nagpur intermediate hub', location:'Delhi Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-29T06:00:00' },
    { status:'IN_TRANSIT', remarks:'Arrived at Nagpur Hub', location:'Nagpur Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-29T16:00:00' },
    { status:'IN_TRANSIT', remarks:'Dispatched to Hyderabad Hub', location:'Nagpur Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-30T08:00:00' },
    { status:'IN_TRANSIT', remarks:'Arrived at Hyderabad Hub — forwarding to Bengaluru', location:'Hyderabad Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-30T18:00:00' },
    { status:'OUT_FOR_DELIVERY', remarks:'Package arrived at Bengaluru Hub. OTP sent to customer.', location:'Bengaluru Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-31T10:00:00' },
    { status:'DELIVERED', remarks:'OTP verified. Delivered by Staff Member.', location:'23 Indiranagar, Bengaluru', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-31T15:45:00' },
  ],
  'TRK-MUM2CHN01': [
    { status:'CREATED', remarks:'Shipment registered.', location:'Mumbai', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-08-30T08:00:00' },
    { status:'DISPATCHED', remarks:'Picked up from sender.', location:'Marine Drive, Mumbai', updatedByEmail:'admin@logitrack.com', updatedAt:'2025-08-30T08:05:00' },
    { status:'IN_TRANSIT', remarks:'Arrived at Mumbai Hub', location:'Mumbai Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-08-30T12:00:00' },
    { status:'IN_TRANSIT', remarks:'Dispatch delayed by 18 hours. Reason: Traffic congestion at Nagpur hub', location:'System', updatedByEmail:'hub.pune@logitrack.com', updatedAt:'2025-09-01T10:00:00' },
    { status:'OUT_FOR_DELIVERY', remarks:'Arrived at Chennai Hub. Out for delivery.', location:'Chennai Hub', updatedByEmail:'staff@logitrack.com', updatedAt:'2025-09-01T10:30:00' },
  ],
};

export const MOCK_HUB_TASKS = [
  { id:1, shipmentTrackingId:'TRK-PUNE2MUM1', hubName:'Pune Hub', hubCity:'Pune', stepOrder:0, isUnlocked:true, status:'ARRIVED', updatedAt:'2025-09-01T11:00:00' },
  { id:2, shipmentTrackingId:'TRK-KOL2HYD01', hubName:'Pune Hub', hubCity:'Pune', stepOrder:0, isUnlocked:true, status:'PENDING', updatedAt:null },
  { id:3, shipmentTrackingId:'TRK-JAI2KOC01', hubName:'Pune Hub', hubCity:'Pune', stepOrder:1, isUnlocked:false, status:'LOCKED', updatedAt:null },
];

export const MOCK_USERS = [
  { id:1, name:'Admin User', email:'admin@logitrack.com', role:'ADMIN', hub:null, createdAt:'2025-01-01T10:00:00' },
  { id:2, name:'Hub Manager — Pune', email:'hub.pune@logitrack.com', role:'HUB_MANAGER', hub:{ id:7, name:'Pune Hub', city:'Pune' }, createdAt:'2025-01-15T10:00:00' },
  { id:3, name:'Hub Manager — Mumbai', email:'hub.mumbai@logitrack.com', role:'HUB_MANAGER', hub:{ id:1, name:'Mumbai Hub', city:'Mumbai' }, createdAt:'2025-01-20T10:00:00' },
  { id:4, name:'Staff Member 1', email:'staff@logitrack.com', role:'STAFF', hub:{ id:7, name:'Pune Hub', city:'Pune' }, createdAt:'2025-02-01T10:00:00' },
  { id:5, name:'Staff Member 2', email:'staff2@logitrack.com', role:'STAFF', hub:{ id:7, name:'Pune Hub', city:'Pune' }, createdAt:'2025-02-10T10:00:00' },
  { id:6, name:'Mumbai Staff', email:'staff.mum@logitrack.com', role:'STAFF', hub:{ id:1, name:'Mumbai Hub', city:'Mumbai' }, createdAt:'2025-03-01T10:00:00' },
];
